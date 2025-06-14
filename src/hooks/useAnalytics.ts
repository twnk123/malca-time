import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalOrders: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  totalRevenue: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  popularDishes: Array<{
     ime: string;
    totalOrders: number;
    totalRevenue: number;
  }>;
  orderTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  averagePickupTime: number; // in minutes
}

export const useAnalytics = (restaurantId?: string) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    if (!restaurantId) return;

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Get total orders and revenue
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
        supabase
          .from('narocila')
          .select('skupna_cena')
          .eq('restavracija_id', restaurantId)
          .gte('created_at', today.toISOString()),
        supabase
          .from('narocila')
          .select('skupna_cena')
          .eq('restavracija_id', restaurantId)
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('narocila')
          .select('skupna_cena')
          .eq('restavracija_id', restaurantId)
          .gte('created_at', monthAgo.toISOString())
      ]);

      // Get popular dishes
      const { data: popularDishesData } = await supabase
        .from('postavke_narocila')
        .select(`
          jed_id,
          kolicina,
          cena_na_kos,
          jedi!inner(ime),
          narocila!inner(restavracija_id)
        `)
        .eq('narocila.restavracija_id', restaurantId)
        .gte('narocila.created_at', monthAgo.toISOString());

      // Get order trends for the last 30 days
      const { data: trendsData } = await supabase
        .from('narocila')
        .select('created_at, skupna_cena')
        .eq('restavracija_id', restaurantId)
        .gte('created_at', monthAgo.toISOString())
        .order('created_at', { ascending: true });

      // Calculate average pickup time
      const { data: pickupTimeData } = await supabase
        .from('narocila')
        .select('created_at, cas_prevzema')
        .eq('restavracija_id', restaurantId)
        .eq('status', 'prevzeto')
        .gte('created_at', monthAgo.toISOString());

      // Process data
      const totalOrders = {
        daily: dailyResult.data?.length || 0,
        weekly: weeklyResult.data?.length || 0,
        monthly: monthlyResult.data?.length || 0
      };

      const totalRevenue = {
        daily: dailyResult.data?.reduce((sum, order) => sum + Number(order.skupna_cena), 0) || 0,
        weekly: weeklyResult.data?.reduce((sum, order) => sum + Number(order.skupna_cena), 0) || 0,
        monthly: monthlyResult.data?.reduce((sum, order) => sum + Number(order.skupna_cena), 0) || 0
      };

      // Process popular dishes
      const dishMap = new Map();
      popularDishesData?.forEach(item => {
        const dishName = item.jedi.ime;
        if (!dishMap.has(dishName)) {
          dishMap.set(dishName, { totalOrders: 0, totalRevenue: 0 });
        }
        const dish = dishMap.get(dishName);
        dish.totalOrders += Number(item.kolicina);
        dish.totalRevenue += Number(item.kolicina) * Number(item.cena_na_kos);
      });

      const popularDishes = Array.from(dishMap.entries())
        .map(([ime, data]) => ({ ime, ...data }))
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, 10);

      // Process order trends
      const trendMap = new Map();
      trendsData?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!trendMap.has(date)) {
          trendMap.set(date, { orders: 0, revenue: 0 });
        }
        const trend = trendMap.get(date);
        trend.orders += 1;
        trend.revenue += Number(order.skupna_cena);
      });

      const orderTrends = Array.from(trendMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate average pickup time
      let averagePickupTime = 0;
      if (pickupTimeData && pickupTimeData.length > 0) {
        const totalMinutes = pickupTimeData.reduce((sum, order) => {
          const orderTime = new Date(order.created_at);
          const pickupTime = new Date(order.cas_prevzema);
          const diffMinutes = (pickupTime.getTime() - orderTime.getTime()) / (1000 * 60);
          return sum + diffMinutes;
        }, 0);
        averagePickupTime = Math.round(totalMinutes / pickupTimeData.length);
      }

      setAnalytics({
        totalOrders,
        totalRevenue,
        popularDishes,
        orderTrends,
        averagePickupTime
      });

    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      toast({
        title: "Napaka pri nalaganju analitike",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
};