import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, Euro, Clock, Download, FileText } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { toast } from '@/hooks/use-toast';

const COLORS = ['hsl(var(--foreground))', 'hsl(var(--muted-foreground))', 'hsl(var(--border))', 'hsl(var(--accent))', 'hsl(var(--secondary))'];

const chartConfig = {
  orders: {
    label: "Naročila",
    color: "hsl(var(--foreground))",
  },
  revenue: {
    label: "Promet",
    color: "hsl(var(--muted-foreground))",
  },
};

export const AdminAnalyticsPage: React.FC = () => {
  const { user } = useAuthContext();
  const { analytics, isLoading } = useAnalytics(user?.restavracija_id);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const generatePDF = async (period: 'daily' | 'weekly' | 'monthly') => {
    if (!analytics) return;

    try {
      // Simple text-based report
      const reportData = {
        period,
        totalOrders: analytics.totalOrders[period],
        totalRevenue: analytics.totalRevenue[period],
        popularDishes: analytics.popularDishes.slice(0, 5),
        averagePickupTime: analytics.averagePickupTime,
        generatedAt: new Date().toLocaleString('sl-SI')
      };

      const reportText = `
ANALITIČNO POROČILO - ${period.toUpperCase()}
Generirano: ${reportData.generatedAt}

═══════════════════════════════════════

PREGLED NAROČIL
• Skupno število naročil: ${reportData.totalOrders}
• Skupni promet: ${reportData.totalRevenue.toFixed(2)}€
• Povprečen čas prevzema: ${reportData.averagePickupTime} min

NAJPOGOSTEJŠE JEDI:
${reportData.popularDishes.map((dish, i) => 
  `${i + 1}. ${dish.ime} - ${dish.totalOrders}x (${dish.totalRevenue.toFixed(2)}€)`
).join('\n')}

═══════════════════════════════════════
`;

      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Poročilo izvoženo",
        description: `Analitično poročilo za ${period} je bilo uspešno izvoženo.`
      });
    } catch (error) {
      toast({
        title: "Napaka pri izvozu",
        description: "Prišlo je do napake pri izvažanju poročila.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Analitika" />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Nalagam analitiko...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Analitika" />
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Ni podatkov za analitiko</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Analitika" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Analitični pregled
            </h2>
            <p className="text-muted-foreground">
              Podrobni vpogled v poslovanje vaše restavracije
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setSelectedPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Dnevno</SelectItem>
                <SelectItem value="weekly">Tedensko</SelectItem>
                <SelectItem value="monthly">Mesečno</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => generatePDF(selectedPeriod)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Izvozi PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Naročila
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalOrders[selectedPeriod]}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === 'daily' ? 'danes' : selectedPeriod === 'weekly' ? 'ta teden' : 'ta mesec'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Promet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalRevenue[selectedPeriod].toFixed(2)}€</div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === 'daily' ? 'danes' : selectedPeriod === 'weekly' ? 'ta teden' : 'ta mesec'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Povprečen čas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averagePickupTime} min</div>
                <p className="text-xs text-muted-foreground">do prevzema</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Povprečno naročilo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalOrders[selectedPeriod] > 0 
                    ? (analytics.totalRevenue[selectedPeriod] / analytics.totalOrders[selectedPeriod]).toFixed(2)
                    : '0.00'
                  }€
                </div>
                <p className="text-xs text-muted-foreground">na naročilo</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trend naročil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.orderTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="var(--color-orders)" 
                        strokeWidth={2}
                        dot={{ fill: "var(--color-orders)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Trend prometa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.orderTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="revenue" 
                        fill="var(--color-revenue)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Popular Dishes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Najpogostejše jedi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.popularDishes.slice(0, 5).map((dish, index) => (
                  <div key={dish.ime} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{dish.ime}</p>
                        <p className="text-sm text-muted-foreground">{dish.totalOrders}x naročeno</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{dish.totalRevenue.toFixed(2)}€</p>
                      <p className="text-sm text-muted-foreground">skupni promet</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};