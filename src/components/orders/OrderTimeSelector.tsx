import React from 'react';
import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAvailablePickupTimes, canOrderFromRestaurant, TimeSlot } from '@/utils/workingHours';

interface OrderTimeSelectorProps {
  delovniCasOd: string;
  delovniCasDo: string;
  selectedTime?: string;
  onTimeChange: (time: string) => void;
  currentTime?: Date;
}

export const OrderTimeSelector: React.FC<OrderTimeSelectorProps> = ({
  delovniCasOd,
  delovniCasDo,
  selectedTime,
  onTimeChange,
  currentTime
}) => {
  const orderingStatus = canOrderFromRestaurant(delovniCasOd, delovniCasDo, currentTime);
  const availableSlots = getAvailablePickupTimes(delovniCasOd, delovniCasDo, currentTime);

  if (!orderingStatus.canOrder) {
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Čas prevzema
        </Label>
        <Alert variant="destructive">
          <AlertDescription>
            {orderingStatus.reason}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Čas prevzema *
      </Label>
      
      <Select value={selectedTime} onValueChange={onTimeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Izberite čas prevzema..." />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {availableSlots.map((slot) => (
            <SelectItem 
              key={slot.value} 
              value={slot.value}
              disabled={slot.disabled}
            >
              {slot.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {availableSlots.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Najkrajši čas prevzema: {availableSlots[0].label}
        </p>
      )}
    </div>
  );
};