import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Jed = Database['public']['Tables']['jedi']['Row'];
type KategorijaMenija = Database['public']['Tables']['kategorije_menija']['Row'];

interface JedForm {
  ime: string;
  opis: string;
  cena: string;
  kategorija_id: string;
  na_voljo: boolean;
}

const defaultJedForm: JedForm = {
  ime: '',
  opis: '',
  cena: '',
  kategorija_id: '',
  na_voljo: true
};

export const AdminMenuPage: React.FC = () => {
  const { user } = useAuthContext();
  const [jedi, setJedi] = useState<Jed[]>([]);
  const [kategorije, setKategorije] = useState<KategorijaMenija[]>([]);
  const [restavracjaId, setRestavracjaId] = useState<string>('');
  const [editingJed, setEditingJed] = useState<Jed | null>(null);
  const [jedForm, setJedForm] = useState<JedForm>(defaultJedForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin's restaurant data
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user?.user_id) return;

      try {
        // Get admin's restaurant
        const { data: adminRestaurant, error: adminError } = await supabase
          .from('admin_restavracije')
          .select(`
            restavracija_id,
            restavracije!inner(*)
          `)
          .eq('admin_id', user.user_id)
          .single();

        if (adminError) throw adminError;

        const restId = adminRestaurant.restavracija_id;
        setRestavracjaId(restId);

        // Fetch categories and dishes
        const [kategorijeSResponse, jediResponse] = await Promise.all([
          supabase
            .from('kategorije_menija')
            .select('*')
            .eq('restavracija_id', restId)
            .order('vrstni_red'),
          supabase
            .from('jedi')
            .select('*')
            .eq('restavracija_id', restId)
            .order('vrstni_red')
        ]);

        if (kategorijeSResponse.error) throw kategorijeSResponse.error;
        if (jediResponse.error) throw jediResponse.error;

        setKategorije(kategorijeSResponse.data || []);
        setJedi(jediResponse.data || []);

        // Set default category if available
        if (kategorijeSResponse.data && kategorijeSResponse.data.length > 0) {
          setJedForm(prev => ({ 
            ...prev, 
            kategorija_id: kategorijeSResponse.data[0].id 
          }));
        }
      } catch (error: any) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "Napaka",
          description: "Napaka pri nalaganju podatkov restavracije.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user?.user_id]);

  const handleSaveJed = async () => {
    if (!jedForm.ime || !jedForm.opis || !jedForm.cena || !jedForm.kategorija_id) {
      toast({
        title: "Napaka",
        description: "Prosimo, izpolnite vsa obvezna polja.",
        variant: "destructive"
      });
      return;
    }

    const cena = parseFloat(jedForm.cena);
    if (isNaN(cena) || cena <= 0) {
      toast({
        title: "Napaka",
        description: "Cena mora biti veljavno pozitivno število.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingJed) {
        // Update existing dish
        const { error } = await supabase
          .from('jedi')
          .update({
            ime: jedForm.ime,
            opis: jedForm.opis,
            cena,
            kategorija_id: jedForm.kategorija_id,
            na_voljo: jedForm.na_voljo
          })
          .eq('id', editingJed.id);

        if (error) throw error;

        // Update local state
        setJedi(prev => prev.map(jed => 
          jed.id === editingJed.id 
            ? { ...jed, ime: jedForm.ime, opis: jedForm.opis, cena, kategorija_id: jedForm.kategorija_id, na_voljo: jedForm.na_voljo }
            : jed
        ));

        toast({
          title: "Jed posodobljena",
          description: `${jedForm.ime} je bila uspešno posodobljena.`,
        });
      } else {
        // Add new dish
        const { data, error } = await supabase
          .from('jedi')
          .insert({
            ime: jedForm.ime,
            opis: jedForm.opis,
            cena,
            kategorija_id: jedForm.kategorija_id,
            restavracija_id: restavracjaId,
            na_voljo: jedForm.na_voljo,
            vrstni_red: jedi.length + 1
          })
          .select()
          .single();

        if (error) throw error;

        setJedi(prev => [...prev, data]);
        toast({
          title: "Jed dodana",
          description: `${jedForm.ime} je bila uspešno dodana v meni.`,
        });
      }

      setJedForm(defaultJedForm);
      setEditingJed(null);
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving dish:', error);
      toast({
        title: "Napaka",
        description: "Napaka pri shranjevanju jedi.",
        variant: "destructive"
      });
    }
  };

  const handleEditJed = (jed: Jed) => {
    setEditingJed(jed);
    setJedForm({
      ime: jed.ime,
      opis: jed.opis || '',
      cena: jed.cena.toString(),
      kategorija_id: jed.kategorija_id,
      na_voljo: jed.na_voljo
    });
    setDialogOpen(true);
  };

  const handleDeleteJed = async (jedId: string) => {
    try {
      const { error } = await supabase
        .from('jedi')
        .delete()
        .eq('id', jedId);

      if (error) throw error;

      setJedi(prev => prev.filter(jed => jed.id !== jedId));
      toast({
        title: "Jed odstranjena",
        description: "Jed je bila uspešno odstranjena iz menija.",
      });
    } catch (error: any) {
      console.error('Error deleting dish:', error);
      toast({
        title: "Napaka",
        description: "Napaka pri brisanju jedi.",
        variant: "destructive"
      });
    }
  };

  const handleToggleAvailability = async (jedId: string) => {
    const jed = jedi.find(j => j.id === jedId);
    if (!jed) return;

    try {
      const { error } = await supabase
        .from('jedi')
        .update({ na_voljo: !jed.na_voljo })
        .eq('id', jedId);

      if (error) throw error;

      setJedi(prev => prev.map(j => 
        j.id === jedId 
          ? { ...j, na_voljo: !j.na_voljo }
          : j
      ));
    } catch (error: any) {
      console.error('Error toggling availability:', error);
      toast({
        title: "Napaka",
        description: "Napaka pri posodabljanju dostopnosti jedi.",
        variant: "destructive"
      });
    }
  };

  const jediPoKategorijah = kategorije.reduce((acc, kategorija) => {
    acc[kategorija.id] = jedi.filter(jed => jed.kategorija_id === kategorija.id);
    return acc;
  }, {} as Record<string, Jed[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Upravljanje menija" />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-muted-foreground">Nalagam...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Upravljanje menija" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Meni restavracije
            </h2>
            <p className="text-muted-foreground">
              Dodajte, uredite ali odstranite jedi iz vašega menija
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => {
                    setEditingJed(null);
                    setJedForm({
                      ...defaultJedForm,
                      kategorija_id: kategorije.length > 0 ? kategorije[0].id : ''
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj jed
                </Button>
              </motion.div>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingJed ? 'Uredi jed' : 'Dodaj novo jed'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ime">Naziv jedi *</Label>
                  <Input
                    id="ime"
                    value={jedForm.ime}
                    onChange={(e) => setJedForm(prev => ({ ...prev, ime: e.target.value }))}
                    placeholder="Vnesite naziv jedi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opis">Opis *</Label>
                  <Textarea
                    id="opis"
                    value={jedForm.opis}
                    onChange={(e) => setJedForm(prev => ({ ...prev, opis: e.target.value }))}
                    placeholder="Opišite jed in sestavine"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cena">Cena (€) *</Label>
                    <Input
                      id="cena"
                      type="number"
                      step="0.01"
                      min="0"
                      value={jedForm.cena}
                      onChange={(e) => setJedForm(prev => ({ ...prev, cena: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kategorija">Kategorija</Label>
                    <Select 
                      value={jedForm.kategorija_id} 
                      onValueChange={(value) => setJedForm(prev => ({ ...prev, kategorija_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {kategorije.map(kategorija => (
                          <SelectItem key={kategorija.id} value={kategorija.id}>
                            {kategorija.naziv}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="na_voljo"
                    checked={jedForm.na_voljo}
                    onCheckedChange={(checked) => setJedForm(prev => ({ ...prev, na_voljo: checked }))}
                  />
                  <Label htmlFor="na_voljo">Na voljo</Label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={handleSaveJed}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingJed ? 'Posodobi' : 'Dodaj'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {kategorije.map((kategorija, kategorijIndex) => (
            <motion.div
              key={kategorija.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: kategorijIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {kategorija.naziv}
                    <Badge variant="secondary">
                      {jediPoKategorijah[kategorija.id]?.length || 0} jedi
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(!jediPoKategorijah[kategorija.id] || jediPoKategorijah[kategorija.id].length === 0) ? (
                    <p className="text-muted-foreground text-center py-8">
                      V tej kategoriji še ni dodanih jedi
                    </p>
                  ) : (
                    jediPoKategorijah[kategorija.id].map((jed, index) => (
                      <motion.div
                        key={jed.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground">
                              {jed.ime}
                            </h4>
                            <Badge 
                              variant={jed.na_voljo ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {jed.na_voljo ? "Na voljo" : "Ni na voljo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {jed.opis}
                          </p>
                          <p className="font-semibold text-foreground">
                            {Number(jed.cena).toFixed(2)}€
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={jed.na_voljo}
                            onCheckedChange={() => handleToggleAvailability(jed.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditJed(jed)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteJed(jed.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};