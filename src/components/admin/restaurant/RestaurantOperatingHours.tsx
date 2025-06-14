import React from 'react';
import { Clock } from 'lucide-react';
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

interface RestaurantOperatingHoursProps {
  restaurant: RestaurantData;
  onUpdate: (updates: Partial<RestaurantData>) => void;
}

export const RestaurantOperatingHours: React.FC<RestaurantOperatingHoursProps> = ({
  restaurant,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Delovni čas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="delovni_cas_od">Odprtje</Label>
          <Input
            id="delovni_cas_od"
            type="time"
            step="900"
            value={restaurant.delovni_cas_od?.substring(0, 5) || ''}
            onChange={(e) => onUpdate({ delovni_cas_od: e.target.value })}
            style={{ 
              colorScheme: 'dark light',
            }}
            className="[&::-webkit-datetime-edit-ampm-field]:hidden [&::-webkit-datetime-edit-ampm-field]:!hidden [&::-webkit-calendar-picker-indicator]:opacity-50"
          />
        </div>

        <div>
          <Label htmlFor="delovni_cas_do">Zaprtje</Label>
          <Input
            id="delovni_cas_do"
            type="time"
            step="900"
            value={restaurant.delovni_cas_do?.substring(0, 5) || ''}
            onChange={(e) => onUpdate({ delovni_cas_do: e.target.value })}
            style={{ 
              colorScheme: 'dark light',
            }}
            className="[&::-webkit-datetime-edit-ampm-field]:hidden [&::-webkit-datetime-edit-ampm-field]:!hidden [&::-webkit-calendar-picker-indicator]:opacity-50"
          />
        </div>
      </CardContent>
    </Card>
  );
};