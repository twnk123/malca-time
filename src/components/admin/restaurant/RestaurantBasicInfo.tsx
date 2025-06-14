import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RestaurantData {
  id: string;
  naziv: string;
  opis: string;
  lokacija: string;
  kontakt: string;
  email: string;
  delovni_cas_od: string;
  delovni_cas_do: string;
  logo_url?: string;
}

interface RestaurantBasicInfoProps {
  restaurant: RestaurantData;
  onUpdate: (updates: Partial<RestaurantData>) => void;
}

export const RestaurantBasicInfo: React.FC<RestaurantBasicInfoProps> = ({
  restaurant,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Osnovni podatki</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="naziv">Naziv restavracije</Label>
          <Input
            id="naziv"
            value={restaurant.naziv}
            onChange={(e) => onUpdate({ naziv: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="opis">Opis</Label>
          <Textarea
            id="opis"
            value={restaurant.opis}
            onChange={(e) => onUpdate({ opis: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="lokacija">Lokacija</Label>
          <Input
            id="lokacija"
            value={restaurant.lokacija}
            onChange={(e) => onUpdate({ lokacija: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};