import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Euro, CheckCircle } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { mockNarocila, Narocilo } from '@/data/mockData';

const stanjaMap = {
  'novo': { label: 'Novo', variant: 'default' as const, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'sprejeto': { label: 'Sprejeto', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  'v_pripravi': { label: 'V pripravi', variant: 'default' as const, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  'pripravljeno': { label: 'Pripravljeno', variant: 'default' as const, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  'prevzeto': { label: 'Prevzeto', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
};

export const AdminOrdersPage: React.FC = () => {
  const [narocila, setNarocila] = useState<Narocilo[]>(
    mockNarocila.filter(narocilo => narocilo.restavracija_id === 'rest_1')
  );
  const [selectedStanje, setSelectedStanje] = useState<string>('vsa');

  const handleUpdateStanje = (narociloId: string, novoStanje: Narocilo['stanje']) => {
    setNarocila(prev => prev.map(narocilo => 
      narocilo.id === narociloId 
        ? { ...narocilo, stanje: novoStanje }
        : narocilo
    ));
    
    toast({
      title: "Stanje posodobljeno",
      description: `Naročilo je označeno kot "${stanjaMap[novoStanje].label}".`,
    });
  };

  const filteredNarocila = selectedStanje === 'vsa' 
    ? narocila 
    : narocila.filter(narocilo => narocilo.stanje === selectedStanje);

  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const aktivnaStanja = Object.keys(stanjaMap).filter(stanje => stanje !== 'prevzeto');

  return (
    <div className="min-h-screen bg-background">
      <Header title="Naročila" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Pregled naročil
            </h2>
            <p className="text-muted-foreground">
              Upravljajte s prejemi naročili in njihovimi stanji
            </p>
          </div>

          <Select value={selectedStanje} onValueChange={setSelectedStanje}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtriraj po stanju" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vsa">Vsa naročila</SelectItem>
              {Object.entries(stanjaMap).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={selectedStanje === 'vsa' ? 'aktivna' : selectedStanje} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="aktivna">Aktivna naročila</TabsTrigger>
            <TabsTrigger value="prevzeto">Zgodovina</TabsTrigger>
          </TabsList>

          <TabsContent value="aktivna">
            <div className="space-y-4">
              {narocila.filter(n => n.stanje !== 'prevzeto').length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Trenutno ni aktivnih naročil</p>
                  </CardContent>
                </Card>
              ) : (
                narocila
                  .filter(narocilo => narocilo.stanje !== 'prevzeto')
                  .map((narocilo, index) => (
                    <OrderCard 
                      key={narocilo.id} 
                      narocilo={narocilo} 
                      index={index}
                      onUpdateStanje={handleUpdateStanje}
                    />
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="prevzeto">
            <div className="space-y-4">
              {narocila.filter(n => n.stanje === 'prevzeto').length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Ni zaključenih naročil</p>
                  </CardContent>
                </Card>
              ) : (
                narocila
                  .filter(narocilo => narocilo.stanje === 'prevzeto')
                  .map((narocilo, index) => (
                    <OrderCard 
                      key={narocilo.id} 
                      narocilo={narocilo} 
                      index={index}
                      onUpdateStanje={handleUpdateStanje}
                      readonly
                    />
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface OrderCardProps {
  narocilo: Narocilo;
  index: number;
  onUpdateStanje: (id: string, stanje: Narocilo['stanje']) => void;
  readonly?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ narocilo, index, onUpdateStanje, readonly = false }) => {
  const stanjeInfo = stanjaMap[narocilo.stanje];
  
  const getNextStanje = (trenutnoStanje: Narocilo['stanje']): Narocilo['stanje'] | null => {
    const zaporedje: Narocilo['stanje'][] = ['novo', 'sprejeto', 'v_pripravi', 'pripravljeno', 'prevzeto'];
    const trenutniIndex = zaporedje.indexOf(trenutnoStanje);
    return trenutniIndex < zaporedje.length - 1 ? zaporedje[trenutniIndex + 1] : null;
  };

  const nextStanje = getNextStanje(narocilo.stanje);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Naročilo #{narocilo.id.slice(-6)}
            </CardTitle>
            <Badge className={stanjeInfo.color}>
              {stanjeInfo.label}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {narocilo.ime_narocnika}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(narocilo.datum_narocila).toLocaleString('sl-SI', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center">
              <Euro className="h-4 w-4 mr-1" />
              {narocilo.skupna_cena.toFixed(2)}€
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 mb-4">
            {narocilo.jedi.map((jed, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{jed.kolicina}x {jed.naziv}</span>
                <span className="font-medium">{(jed.cena * jed.kolicina).toFixed(2)}€</span>
              </div>
            ))}
          </div>

          {!readonly && nextStanje && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full"
                onClick={() => onUpdateStanje(narocilo.id, nextStanje)}
              >
                Označi kot "{stanjaMap[nextStanje].label}"
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};