import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface RestaurantContactInfoProps {
  restaurant: RestaurantData;
  onUpdate: (updates: Partial<RestaurantData>) => void;
}

export const RestaurantContactInfo: React.FC<RestaurantContactInfoProps> = ({
  restaurant,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontaktni podatki</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={restaurant.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="kontakt">Telefon</Label>
          <Input
            id="kontakt"
            value={restaurant.kontakt}
            onChange={(e) => onUpdate({ kontakt: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};