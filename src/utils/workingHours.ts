import { format, addMinutes, isAfter, isBefore, parse } from 'date-fns';

export interface TimeSlot {
  value: string;
  label: string;
  disabled?: boolean;
}

export const isRestaurantOpen = (
  delovniCasOd: string, 
  delovniCasDo: string, 
  currentTime?: Date
): boolean => {
  const now = currentTime || new Date();
  const today = format(now, 'yyyy-MM-dd');
  
  // Remove seconds and keep only HH:mm format
  const formatTime = (timeStr: string) => timeStr.substring(0, 5);
  
  const openTime = parse(`${today} ${formatTime(delovniCasOd)}`, 'yyyy-MM-dd HH:mm', new Date());
  let closeTime = parse(`${today} ${formatTime(delovniCasDo)}`, 'yyyy-MM-dd HH:mm', new Date());
  
  // Handle overnight hours (e.g., 21:00 to 05:00)
  if (isBefore(closeTime, openTime)) {
    // If close time is before open time, it means it closes the next day
    closeTime = addMinutes(closeTime, 24 * 60); // Add 24 hours
    
    // Check if current time is after opening OR before closing (next day)
    const nowTomorrow = addMinutes(now, 24 * 60);
    return isAfter(now, openTime) || isBefore(nowTomorrow, closeTime);
  }
  
  return isAfter(now, openTime) && isBefore(now, closeTime);
};

export const getAvailablePickupTimes = (
  delovniCasOd: string,
  delovniCasDo: string,
  currentTime?: Date
): TimeSlot[] => {
  const now = currentTime || new Date();
  const today = format(now, 'yyyy-MM-dd');
  
  // Remove seconds and keep only HH:mm format
  const formatTime = (timeStr: string) => timeStr.substring(0, 5);
  
  // Restaurant opening and closing times today
  const openTime = parse(`${today} ${formatTime(delovniCasOd)}`, 'yyyy-MM-dd HH:mm', new Date());
  let closeTime = parse(`${today} ${formatTime(delovniCasDo)}`, 'yyyy-MM-dd HH:mm', new Date());
  
  // Handle overnight hours
  if (isBefore(closeTime, openTime)) {
    closeTime = addMinutes(closeTime, 24 * 60); // Add 24 hours
  }
  
  // Earliest pickup time is now + 30 minutes
  const earliestPickup = addMinutes(now, 30);
  
  // Start from the later of: restaurant opening time or earliest pickup time
  let startTime = isAfter(earliestPickup, openTime) ? earliestPickup : openTime;
  
  // Round up to nearest 10-minute interval
  const minutes = startTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 10) * 10;
  startTime = new Date(startTime);
  startTime.setMinutes(roundedMinutes);
  startTime.setSeconds(0);
  
  const timeSlots: TimeSlot[] = [];
  let currentSlot = new Date(startTime);
  
  // Generate 10-minute intervals until closing time
  while (isBefore(currentSlot, closeTime)) {
    const timeValue = format(currentSlot, 'HH:mm');
    const timeLabel = format(currentSlot, 'HH:mm');
    
    timeSlots.push({
      value: timeValue,
      label: timeLabel,
      disabled: false
    });
    
    currentSlot = addMinutes(currentSlot, 10);
  }
  
  return timeSlots;
};

export const canOrderFromRestaurant = (
  delovniCasOd: string,
  delovniCasDo: string,
  currentTime?: Date
): { canOrder: boolean; reason?: string } => {
  const now = currentTime || new Date();
  const availableSlots = getAvailablePickupTimes(delovniCasOd, delovniCasDo, now);
  
  if (availableSlots.length === 0) {
    return {
      canOrder: false,
      reason: "Restavracija trenutno ne sprejema naročil. Poskusite v delovnem času."
    };
  }
  
  return { canOrder: true };
};

export const getOrderingStatus = (
  delovniCasOd: string,
  delovniCasDo: string,
  currentTime?: Date
): 'open' | 'closed' | 'closing_soon' => {
  const now = currentTime || new Date();
  const today = format(now, 'yyyy-MM-dd');
  
  // Remove seconds and keep only HH:mm format
  const formatTime = (timeStr: string) => timeStr.substring(0, 5);
  
  let closeTime = parse(`${today} ${formatTime(delovniCasDo)}`, 'yyyy-MM-dd HH:mm', new Date());
  const openTime = parse(`${today} ${formatTime(delovniCasOd)}`, 'yyyy-MM-dd HH:mm', new Date());
  
  // Handle overnight hours
  if (isBefore(closeTime, openTime)) {
    closeTime = addMinutes(closeTime, 24 * 60); // Add 24 hours
  }
  
  const closingSoonTime = addMinutes(closeTime, -60); // 1 hour before closing
  
  const isOpen = isRestaurantOpen(delovniCasOd, delovniCasDo, now);
  
  if (!isOpen) {
    return 'closed';
  }
  
  if (isAfter(now, closingSoonTime)) {
    return 'closing_soon';
  }
  
  return 'open';
};