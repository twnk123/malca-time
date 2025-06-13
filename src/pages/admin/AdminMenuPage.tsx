import React, { useState } from 'react';
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
import { mockJedi, Jed } from '@/data/mockData';

interface JedForm {
  naziv: string;
  opis: string;
  cena: string;
  kategorija: string;
  na_voljo: boolean;
}

const defaultJedForm: JedForm = {
  naziv: '',
  opis: '',
  cena: '',
  kategorija: 'Glavne jedi',
  na_voljo: true
};

const kategorije = ['Glavne jedi', 'Juhe', 'Pijače', 'Sladice'];

export const AdminMenuPage: React.FC = () => {
  const [jedi, setJedi] = useState<Jed[]>(
    mockJedi.filter(jed => jed.restavracija_id === 'rest_1')
  );
  const [editingJed, setEditingJed] = useState<Jed | null>(null);
  const [jedForm, setJedForm] = useState<JedForm>(defaultJedForm);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSaveJed = () => {
    if (!jedForm.naziv || !jedForm.opis || !jedForm.cena) {
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

    if (editingJed) {
      // Urejanje
      setJedi(prev => prev.map(jed => 
        jed.id === editingJed.id 
          ? { ...jed, ...jedForm, cena }
          : jed
      ));
      toast({
        title: "Jed posodobljena",
        description: `${jedForm.naziv} je bila uspešno posodobljena.`,
      });
    } else {
      // Dodajanje nove
      const novaJed: Jed = {
        id: `jed_${Date.now()}`,
        naziv: jedForm.naziv,
        opis: jedForm.opis,
        cena,
        kategorija: jedForm.kategorija,
        restavracija_id: 'rest_1',
        na_voljo: jedForm.na_voljo
      };
      setJedi(prev => [...prev, novaJed]);
      toast({
        title: "Jed dodana",
        description: `${jedForm.naziv} je bila uspešno dodana v meni.`,
      });
    }

    setJedForm(defaultJedForm);
    setEditingJed(null);
    setDialogOpen(false);
  };

  const handleEditJed = (jed: Jed) => {
    setEditingJed(jed);
    setJedForm({
      naziv: jed.naziv,
      opis: jed.opis,
      cena: jed.cena.toString(),
      kategorija: jed.kategorija,
      na_voljo: jed.na_voljo
    });
    setDialogOpen(true);
  };

  const handleDeleteJed = (jedId: string) => {
    setJedi(prev => prev.filter(jed => jed.id !== jedId));
    toast({
      title: "Jed odstranjena",
      description: "Jed je bila uspešno odstranjena iz menija.",
    });
  };

  const handleToggleAvailability = (jedId: string) => {
    setJedi(prev => prev.map(jed => 
      jed.id === jedId 
        ? { ...jed, na_voljo: !jed.na_voljo }
        : jed
    ));
  };

  const jediPoKategorijah = kategorije.reduce((acc, kategorija) => {
    acc[kategorija] = jedi.filter(jed => jed.kategorija === kategorija);
    return acc;
  }, {} as Record<string, Jed[]>);

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
                    setJedForm(defaultJedForm);
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
                  <Label htmlFor="naziv">Naziv jedi *</Label>
                  <Input
                    id="naziv"
                    value={jedForm.naziv}
                    onChange={(e) => setJedForm(prev => ({ ...prev, naziv: e.target.value }))}
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
                      value={jedForm.kategorija} 
                      onValueChange={(value) => setJedForm(prev => ({ ...prev, kategorija: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {kategorije.map(kategorija => (
                          <SelectItem key={kategorija} value={kategorija}>
                            {kategorija}
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
              key={kategorija}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: kategorijIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {kategorija}
                    <Badge variant="secondary">
                      {jediPoKategorijah[kategorija].length} jedi
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jediPoKategorijah[kategorija].length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      V tej kategoriji še ni dodanih jedi
                    </p>
                  ) : (
                    jediPoKategorijah[kategorija].map((jed, index) => (
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
                              {jed.naziv}
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
                            {jed.cena.toFixed(2)}€
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