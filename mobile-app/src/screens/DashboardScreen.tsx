import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Megaphone, AlertTriangle, BrainCircuit,
  ChevronRight, CheckCircle2, Clock, Zap, Package,
  ArrowUpRight, ArrowDownRight, Flame, BarChart3,
  ChevronDown,
} from 'lucide-react-native';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { dashboardApi } from '../api/endpoints';
import { LineChart, BarChart } from 'react-native-gifted-charts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metrics { total_revenue: number; orders_today: number; active_campaigns: number; low_stock_alerts: number; }
interface MonthlySalesPoint { month: string; revenue: number; orders: number; }
interface LowStockItem { product_id: number; product_name: string; sku: string; city: string; quantity: number; threshold: number; }
interface HighDemandItem { product_id: number; product_name: string; sku: string; category: string; total_sold: number; total_revenue: number; }

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skel = ({ w = 'w-full', h = 'h-4', r = 'rounded-lg' }: { w?: string; h?: string; r?: string }) => (
  <View className={`${w} ${h} ${r} bg-slate-200`} />
);

const MetricsSkeleton = () => (
  <View className="flex-row justify-between flex-wrap px-5 gap-3 mb-6">
    {[1, 2, 3, 4].map(i => (
      <View key={i} className="rounded-2xl p-4" style={{ width: '46%', backgroundColor: '#F1F5F9', height: 100 }}>
        <Skel w="w-8" h="h-8" r="rounded-full" />
        <View className="mt-3"><Skel w="w-16" h="h-3" /></View>
        <View className="mt-2"><Skel w="w-24" h="h-5" /></View>
      </View>
    ))}
  </View>
);

// ─── KPI Card (2-column grid) ──────────────────────────────────────────────

const KPI_COLORS = {
  revenue: { bg: '#EFF6FF', accent: '#2563EB', icon: '#1D4ED8' },
  orders: { bg: '#F0FDF4', accent: '#16A34A', icon: '#15803D' },
  campaigns: { bg: '#FDF4FF', accent: '#9333EA', icon: '#7E22CE' },
  alerts: { bg: '#FFF7ED', accent: '#EA580C', icon: '#C2410C' },
};

interface KpiProps { label: string; value: string; isUp?: boolean; change?: string; colorKey: keyof typeof KPI_COLORS; icon: React.ReactNode; }
const KpiCard = ({ label, value, isUp = true, change, colorKey, icon }: KpiProps) => {
  const c = KPI_COLORS[colorKey];
  return (
    <View className="rounded-2xl p-4 flex-1" style={{ backgroundColor: c.bg, borderWidth: 1, borderColor: `${c.accent}20` }}>
      <View className="flex-row justify-between items-start mb-3">
        <View className="p-2 rounded-xl" style={{ backgroundColor: `${c.accent}18` }}>{icon}</View>
        {change && (
          <View className="flex-row items-center px-1.5 py-0.5 rounded-full" style={{ backgroundColor: isUp ? '#DCFCE7' : '#FEE2E2' }}>
            {isUp ? <ArrowUpRight size={10} color="#16A34A" /> : <ArrowDownRight size={10} color="#DC2626" />}
            <Text style={{ fontSize: 10, color: isUp ? '#16A34A' : '#DC2626', fontWeight: '700', marginLeft: 1 }}>{change}</Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: `${c.accent}99`, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>{value}</Text>
    </View>
  );
};

// ─── Monthly Sales Section ─────────────────────────────────────────────────

const YEARS = [2026, 2025, 2024];

const MonthlySalesSection = () => {
  const [year, setYear] = useState(2026);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const { data, isLoading } = useQuery<{ data: MonthlySalesPoint[] }>({
    queryKey: ['monthly-sales', year],
    queryFn: () => dashboardApi.getMonthlySales(year),
  });

  const chartData = (data?.data || []).map(d => ({
    value: d.revenue / 1000,  // show in thousands
    label: d.month,
    frontColor: '#2563EB',
    topLabelComponent: () => null,
  }));

  const hasData = chartData.some(d => d.value > 0);

  return (
    <View className="mx-5 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>Monthly Sales</Text>
          <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Revenue in PKR thousands</Text>
        </View>
        {/* Year Dropdown */}
        <TouchableOpacity
          onPress={() => setShowYearPicker(!showYearPicker)}
          className="flex-row items-center px-3 py-1.5 rounded-xl"
          style={{ backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F172A', marginRight: 4 }}>{year}</Text>
          <ChevronDown size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Inline picker */}
      {showYearPicker && (
        <View className="absolute right-0 top-10 z-10 rounded-xl overflow-hidden" style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', elevation: 8, shadowOpacity: 0.1, shadowRadius: 8 }}>
          {YEARS.map(y => (
            <TouchableOpacity key={y} onPress={() => { setYear(y); setShowYearPicker(false); }}
              className="px-5 py-3" style={{ backgroundColor: y === year ? '#EFF6FF' : '#FFF' }}>
              <Text style={{ color: y === year ? '#2563EB' : '#0F172A', fontWeight: y === year ? '700' : '400' }}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View className="rounded-2xl p-4" style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' }}>
        {isLoading ? (
          <View className="items-center py-8"><ActivityIndicator color="#2563EB" /></View>
        ) : !hasData ? (
          <NoDataView message="No sales data for this year" />
        ) : (
          <BarChart
            data={chartData}
            barWidth={18}
            spacing={8}
            roundedTop
            hideRules
            xAxisLabelTextStyle={{ fontSize: 9, color: '#94A3B8' }}
            yAxisTextStyle={{ fontSize: 9, color: '#94A3B8' }}
            noOfSections={4}
            barBorderRadius={4}
            frontColor="#2563EB"
            gradientColor="#93C5FD"
            showGradient
            height={180}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor="#E2E8F0"
          />
        )}
      </View>
    </View>
  );
};

// ─── No Data View ─────────────────────────────────────────────────────────────

const NoDataView = ({ message }: { message: string }) => (
  <View className="items-center py-10">
    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Package size={28} color="#CBD5E1" />
    </View>
    <Text style={{ fontSize: 14, fontWeight: '600', color: '#94A3B8' }}>No Data Found</Text>
    <Text style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4, textAlign: 'center' }}>{message}</Text>
  </View>
);

// ─── Low Stock Section ────────────────────────────────────────────────────────

const LowStockSection = () => {
  const { data, isLoading } = useQuery<{ items: LowStockItem[] }>({
    queryKey: ['low-stock'],
    queryFn: dashboardApi.getLowStock,
  });

  const items = data?.items || [];

  return (
    <View className="mx-5 mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>⚠ Low Stock Alerts</Text>
        <Text style={{ fontSize: 12, color: '#EA580C', fontWeight: '600' }}>{items.length} items</Text>
      </View>
      <View className="rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#FED7AA' }}>
        {isLoading ? (
          <View className="p-5 items-center"><ActivityIndicator color="#EA580C" /></View>
        ) : items.length === 0 ? (
          <View style={{ backgroundColor: '#FFF7ED' }}>
            <NoDataView message="All stock levels are healthy" />
          </View>
        ) : (
          items.map((item, index) => (
            <View key={`${item.product_id}-${item.city}`}
              className="flex-row items-center px-4 py-3"
              style={{ backgroundColor: index % 2 === 0 ? '#FFF7ED' : '#FFFFFF', borderBottomWidth: index < items.length - 1 ? 1 : 0, borderBottomColor: '#FED7AA' }}>
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#FEE0C0' }}>
                <AlertTriangle size={14} color="#EA580C" />
              </View>
              <View className="flex-1">
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }} numberOfLines={1}>{item.product_name}</Text>
                <Text style={{ fontSize: 11, color: '#94A3B8' }}>{item.city} · {item.sku}</Text>
              </View>
              <View className="items-end">
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#EA580C' }}>{item.quantity}</Text>
                <Text style={{ fontSize: 10, color: '#94A3B8' }}>/ {item.threshold} min</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

// ─── High Demand Section ──────────────────────────────────────────────────────

const HighDemandSection = () => {
  const { data, isLoading } = useQuery<{ items: HighDemandItem[] }>({
    queryKey: ['high-demand'],
    queryFn: dashboardApi.getHighDemand,
  });

  const items = data?.items || [];
  const maxSold = Math.max(...items.map(i => i.total_sold), 1);

  return (
    <View className="mx-5 mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>🔥 High Demand Products</Text>
        <View className="flex-row items-center">
          <Flame size={13} color="#EA580C" />
          <Text style={{ fontSize: 12, color: '#EA580C', fontWeight: '600', marginLeft: 3 }}>Top {items.length}</Text>
        </View>
      </View>
      <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' }}>
        {isLoading ? (
          <View className="p-5 items-center"><ActivityIndicator color="#2563EB" /></View>
        ) : items.length === 0 ? (
          <NoDataView message="No sales recorded yet" />
        ) : (
          items.map((item, index) => {
            const pct = item.total_sold / maxSold;
            return (
              <View key={item.product_id} className="px-4 py-3"
                style={{ borderBottomWidth: index < items.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
                <View className="flex-row items-center mb-1.5">
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B', width: 20 }}>#{index + 1}</Text>
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#0F172A' }} numberOfLines={1}>{item.product_name}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#2563EB' }}>{item.total_sold} sold</Text>
                </View>
                {/* Demand bar */}
                <View style={{ height: 4, backgroundColor: '#E2E8F0', borderRadius: 4, marginLeft: 20 }}>
                  <View style={{ width: `${pct * 100}%`, height: 4, backgroundColor: index === 0 ? '#EF4444' : index === 1 ? '#F97316' : '#2563EB', borderRadius: 4 }} />
                </View>
                <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, marginLeft: 20 }}>
                  ₨ {item.total_revenue.toLocaleString()} revenue · {item.category}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

// ─── AI Actions Section ───────────────────────────────────────────────────────

const ACTION_STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  executed: { color: '#16A34A', bg: '#DCFCE7', icon: <CheckCircle2 size={14} color="#16A34A" /> },
  pending: { color: '#EA580C', bg: '#FEE0C0', icon: <Clock size={14} color="#EA580C" /> },
  insight: { color: '#2563EB', bg: '#DBEAFE', icon: <Zap size={14} color="#2563EB" /> },
};

const RECENT_AI_ACTIONS = [
  { id: 1, time: '2 min ago', type: 'Campaign Created', description: 'Launched "Karachi Summer Surge" at 18% discount targeting high-abandon carts.', status: 'executed', impact: '+₨ 82,000 projected' },
  { id: 2, time: '47 min ago', type: 'Price Adjustment', description: 'Reduced price on SKU-2041 by 12% in Lahore after 3-day low velocity analysis.', status: 'executed', impact: '+23% velocity' },
  { id: 3, time: '2 hrs ago', type: 'Inventory Alert', description: 'Reorder triggered for Galaxy A15 — Islamabad stock below threshold (4 units).', status: 'pending', impact: 'Awaiting approval' },
];

const RecentAIActionsSection = () => (
  <View className="px-5 pb-8">
    <View className="flex-row justify-between items-center mb-4">
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>Recent AI Actions</Text>
      <TouchableOpacity className="flex-row items-center">
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#2563EB', marginRight: 2 }}>View All</Text>
        <ChevronRight size={14} color="#2563EB" />
      </TouchableOpacity>
    </View>
    {RECENT_AI_ACTIONS.map((item, index) => {
      const s = ACTION_STATUS_CONFIG[item.status] || ACTION_STATUS_CONFIG.insight;
      return (
        <View key={item.id} className="flex-row">
          <View className="items-center mr-3" style={{ width: 32 }}>
            <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: s.bg }}>{s.icon}</View>
            {index < RECENT_AI_ACTIONS.length - 1 && <View style={{ flex: 1, width: 1, backgroundColor: '#E2E8F0', marginVertical: 4 }} />}
          </View>
          <View className="flex-1 pb-5">
            <View className="flex-row justify-between items-center mb-1">
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{item.type}</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8' }}>{item.time}</Text>
            </View>
            <Text style={{ fontSize: 12, lineHeight: 17, color: '#475569', marginBottom: 6 }}>{item.description}</Text>
            <View className="self-start px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: s.color }}>{item.impact}</Text>
            </View>
          </View>
        </View>
      );
    })}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const DashboardScreen = () => {
  const { data: metrics, isLoading, isRefetching, refetch } = useQuery<Metrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardApi.getMetrics,
  });

  const fmt = (n: number) => n >= 1000000 ? `₨${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₨${(n / 1000).toFixed(0)}K` : `₨${n}`;

  return (
    <ScreenWrapper noPadding>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />}
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <View className="flex-row items-center mb-1">
            <BrainCircuit size={18} color="#2563EB" />
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#2563EB', marginLeft: 6, textTransform: 'uppercase' }}>NexusForge</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0F172A' }}>Operations Overview</Text>
          <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>AI-managed · Live data</Text>
        </View>

        {/* KPI Grid */}
        {isLoading ? <MetricsSkeleton /> : (
          <View className="px-5 mb-6">
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <KpiCard label="Total Revenue" value={fmt(metrics?.total_revenue ?? 0)} isUp change="+14%" colorKey="revenue" icon={<TrendingUp size={18} color={KPI_COLORS.revenue.icon} />} />
              <KpiCard label="Total Orders" value={(metrics?.orders_today ?? 0).toLocaleString()} isUp change="+8%" colorKey="orders" icon={<CheckCircle2 size={18} color={KPI_COLORS.orders.icon} />} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <KpiCard label="Campaigns" value={`${metrics?.active_campaigns ?? 0} Active`} colorKey="campaigns" icon={<Megaphone size={18} color={KPI_COLORS.campaigns.icon} />} />
              <KpiCard label="Low Stock" value={`${metrics?.low_stock_alerts ?? 0} SKUs`} isUp={false} change="High" colorKey="alerts" icon={<AlertTriangle size={18} color={KPI_COLORS.alerts.icon} />} />
            </View>
          </View>
        )}

        {/* Monthly Sales Chart */}
        <MonthlySalesSection />

        {/* Low Stock */}
        <LowStockSection />

        {/* High Demand */}
        <HighDemandSection />

        {/* Recent AI Actions */}
        <RecentAIActionsSection />
      </ScrollView>
    </ScreenWrapper>
  );
};
