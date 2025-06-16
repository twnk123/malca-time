import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Percent, Euro, Calendar as CalendarIcon, Target } from 'lucide-react';
import { format } from 'date-fns';
import { sl } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Jed = Database['public']['Tables']['jedi']['Row'];
type Popust = Database['public']['Tables']['popusti']['Row'];

interface DiscountForm {
  jed_id: string;
  tip_popusta: 'procent' | 'znesek';
  vrednost: string;
  naziv?: string;
  opis?: string;
  aktiven: boolean;
  veljavnost_od?: Date;
  veljavnost_do?: Date;
}

const defaultDiscountForm: DiscountForm = {
  jed_id: '',
  tip_popusta: 'procent',
  vrednost: '',
  naziv: '',
  opis: '',
  aktiven: true,
  veljavnost_od: undefined,
  veljavnost_do: undefined
};

interface DiscountManagerProps {
  jedi: Jed[];
  restaurantId: string;
  onDiscountChange: () => void;
}

export const DiscountManager: React.FC<DiscountManagerProps> = ({ 
  jedi, 
  restaurantId, 
  onDiscountChange 
}) => {
  const [popusti, setPopusti] = useState<Popust[]>([]);
  const [editingPopust, setEditingPopust] = useState<Popust | null>(null);
  const [popustForm, setPopustForm] = useState<DiscountForm>(defaultDiscountForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscounts();
  }, [restaurantId]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      
      // Get all discounts for dishes from this restaurant
      const jedIds = jedi.map(jed => jed.id);
      if (jedIds.length === 0) return;

      const { data, error } = await supabase
        .from('popusti')
        .select('*')
        .in('jed_id', jedIds);

      if (error) throw error;

      setPopusti(data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast({
        title: "Napaka",
        description: "Napaka pri nalaganju popustov.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiscount = async () => {
    if (!popustForm.jed_id || !popustForm.vrednost) {
      toast({
        title: "Napaka",
        description: "Prosimo, izpolnite vsa obvezna polja.",
        variant: "destructive"
      });
      return;
    }

    const vrednost = parseFloat(popustForm.vrednost);
    if (isNaN(vrednost) || vrednost <= 0) {
      toast({
        title: "Napaka",
        description: "Vrednost popusta mora biti pozitivno število.",
        variant: "destructive"
      });
      return;
    }

    if (popustForm.tip_popusta === 'procent' && vrednost > 100) {
      toast({
        title: "Napaka", 
        description: "Popust v procentih ne more biti večji od 100%.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingPopust) {
        // Update existing discount
        const { error } = await supabase
          .from('popusti')
          .update({
            tip_popusta: popustForm.tip_popusta,
            vrednost,
            naziv: popustForm.naziv || null,
            opis: popustForm.opis || null,
            aktiven: popustForm.aktiven,
            veljavnost_od: popustForm.veljavnost_od ? popustForm.veljavnost_od.toISOString() : null,
            veljavnost_do: popustForm.veljavnost_do ? popustForm.veljavnost_do.toISOString() : null
          })
          .eq('id', editingPopust.id);

        if (error) throw error;

        toast({
          title: "Popust posodobljen",
          description: "Popust je bil uspešno posodobljen."
        });
      } else {
        // Create new discount
        const { error } = await supabase
          .from('popusti')
          .insert({
            jed_id: popustForm.jed_id,
            tip_popusta: popustForm.tip_popusta,
            vrednost,
            naziv: popustForm.naziv || null,
            opis: popustForm.opis || null,
            aktiven: popustForm.aktiven,
            veljavnost_od: popustForm.veljavnost_od ? popustForm.veljavnost_od.toISOString() : null,
            veljavnost_do: popustForm.veljavnost_do ? popustForm.veljavnost_do.toISOString() : null
          });

        if (error) throw error;

        toast({
          title: "Popust dodan",
          description: "Nov popust je bil uspešno dodan."
        });
      }

      setPopustForm(defaultDiscountForm);
      setEditingPopust(null);
      setDialogOpen(false);
      await fetchDiscounts();
      onDiscountChange();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      toast({
        title: "Napaka",
        description: "Napaka pri shranjevanju popusta.",
        variant: "destructive"
      });
    }
  };

  const handleEditDiscount = (popust: Popust) => {
    setEditingPopust(popust);
    setPopustForm({
      jed_id: popust.jed_id,
      tip_popusta: popust.tip_popusta as 'procent' | 'znesek',
      vrednost: popust.vrednost.toString(),
      naziv: popust.naziv || '',
      opis: popust.opis || '',
      aktiven: popust.aktiven,
      veljavnost_od: popust.veljavnost_od ? new Date(popust.veljavnost_od) : undefined,
      veljavnost_do: popust.veljavnost_do ? new Date(popust.veljavnost_do) : undefined
    });
    setDialogOpen(true);
  };

  const handleDeleteDiscount = async (popustId: string) => {
    try {
      const { error } = await supabase
        .from('popusti')
        .delete()
        .eq('id', popustId);

      if (error) throw error;

      toast({
        title: "Popust odstranjen",
        description: "Popust je bil uspešno odstranjen."
      });

      await fetchDiscounts();
      onDiscountChange();
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      toast({
        title: "Napaka",
        description: "Napaka pri brisanju popusta.",
        variant: "destructive"
      });
    }
  };

  const toggleDiscountStatus = async (popustId: string, aktiven: boolean) => {
    try {
      const { error } = await supabase
        .from('popusti')
        .update({ aktiven: !aktiven })
        .eq('id', popustId);

      if (error) throw error;

      await fetchDiscounts();
      onDiscountChange();
    } catch (error: any) {
      console.error('Error toggling discount:', error);
      toast({
        title: "Napaka",
        description: "Napaka pri posodabljanju statusa popusta.",
        variant: "destructive"
      });
    }
  };

  const getJedName = (jedId: string) => {
    const jed = jedi.find(j => j.id === jedId);
    return jed?.ime || 'Neznana jed';
  };

  if (loading) {
    return <div className="text-center py-4">Nalagam popuste...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Upravljanje popustov
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPopust(null);
                  setPopustForm(defaultDiscountForm);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Dodaj popust
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPopust ? 'Uredi popust' : 'Dodaj nov popust'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Jed *</Label>
                  <Select 
                    value={popustForm.jed_id} 
                    onValueChange={(value) => setPopustForm(prev => ({ ...prev, jed_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Izberite jed..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jedi.map(jed => (
                        <SelectItem key={jed.id} value={jed.id}>
                          {jed.ime} ({Number(jed.cena).toFixed(2)}€)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tip popusta *</Label>
                    <Select 
                      value={popustForm.tip_popusta} 
                      onValueChange={(value: 'procent' | 'znesek') => setPopustForm(prev => ({ ...prev, tip_popusta: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="procent">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Procent (%)
                          </div>
                        </SelectItem>
                        <SelectItem value="znesek">
                          <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4" />
                            Znesek (€)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Vrednost *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={popustForm.tip_popusta === 'procent' ? '100' : undefined}
                      value={popustForm.vrednost}
                      onChange={(e) => setPopustForm(prev => ({ ...prev, vrednost: e.target.value }))}
                      placeholder={popustForm.tip_popusta === 'procent' ? '0-100' : '0.00'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Naziv popusta</Label>
                  <Input
                    value={popustForm.naziv}
                    onChange={(e) => setPopustForm(prev => ({ ...prev, naziv: e.target.value }))}
                    placeholder="npr. Popust za nove uporabnike"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opis</Label>
                  <Textarea
                    value={popustForm.opis}
                    onChange={(e) => setPopustForm(prev => ({ ...prev, opis: e.target.value }))}
                    placeholder="Dodajte opis popusta..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Velja od</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !popustForm.veljavnost_od && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {popustForm.veljavnost_od ? format(popustForm.veljavnost_od, 'dd.MM.yyyy', { locale: sl }) : 'Izberite datum'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={popustForm.veljavnost_od}
                          onSelect={(date) => setPopustForm(prev => ({ ...prev, veljavnost_od: date }))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Velja do</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !popustForm.veljavnost_do && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {popustForm.veljavnost_do ? format(popustForm.veljavnost_do, 'dd.MM.yyyy', { locale: sl }) : 'Izberite datum'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={popustForm.veljavnost_do}
                          onSelect={(date) => setPopustForm(prev => ({ ...prev, veljavnost_do: date }))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={popustForm.aktiven}
                    onCheckedChange={(checked) => setPopustForm(prev => ({ ...prev, aktiven: checked }))}
                  />
                  <Label>Aktivni popust</Label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={handleSaveDiscount}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingPopust ? 'Posodobi' : 'Dodaj'}
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
      </CardHeader>
      <CardContent>
        {popusti.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Ni dodanih popustov. Dodajte prvi popust za privabljanje strank.
          </p>
        ) : (
          <div className="space-y-3">
            {popusti.map((popust) => (
              <motion.div
                key={popust.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-foreground">
                      {getJedName(popust.jed_id)}
                    </h4>
                    <Badge 
                      variant={popust.aktiven ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {popust.tip_popusta === 'procent' ? `${popust.vrednost}%` : `${popust.vrednost}€`}
                    </Badge>
                    {!popust.aktiven && (
                      <Badge variant="outline" className="text-xs">
                        Neaktiven
                      </Badge>
                    )}
                  </div>
                  {popust.naziv && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {popust.naziv}
                    </p>
                  )}
                  {(popust.veljavnost_od || popust.veljavnost_do) && (
                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="w-3 h-3" />
                      {popust.veljavnost_od && (
                        <span>Od: {new Date(popust.veljavnost_od).toLocaleDateString('sl-SI')}</span>
                      )}
                      {popust.veljavnost_do && (
                        <span>Do: {new Date(popust.veljavnost_do).toLocaleDateString('sl-SI')}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={popust.aktiven}
                    onCheckedChange={() => toggleDiscountStatus(popust.id, popust.aktiven)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditDiscount(popust)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDiscount(popust.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};