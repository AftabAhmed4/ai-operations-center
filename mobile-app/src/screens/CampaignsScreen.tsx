import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import {
  BrainCircuit, Megaphone, Tag, MapPin, CalendarDays, Users, ChevronRight, Sparkles,
} from 'lucide-react-native';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { CAMPAIGNS_MOCK } from '../api/mocks_extended';

// ─── Types ───────────────────────────────────────────────────────────────────

type Campaign = typeof CAMPAIGNS_MOCK[0];

// ─── Filter Chip ──────────────────────────────────────────────────────────────

const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="mr-2 px-4 py-1.5 rounded-full border"
    style={{ backgroundColor: active ? '#2563EB' : '#FFFFFF', borderColor: active ? '#2563EB' : '#E2E8F0' }}
  >
    <Text className="text-sm font-semibold" style={{ color: active ? '#FFFFFF' : '#64748B' }}>{label}</Text>
  </TouchableOpacity>
);

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Active', color: '#16A34A', bg: '#DCFCE7', dot: '#4ADE80' },
  scheduled: { label: 'Scheduled', color: '#2563EB', bg: '#DBEAFE', dot: '#60A5FA' },
  ended: { label: 'Ended', color: '#64748B', bg: '#F1F5F9', dot: '#94A3B8' },
};

// ─── Campaign Card ────────────────────────────────────────────────────────────

const CampaignCard = ({ item }: { item: Campaign }) => {
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.ended;
  const isActive = item.status === 'active';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="mb-4 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: isActive ? '#BBF7D0' : '#E2E8F0',
      }}
    >
      {/* Top stripe for active */}
      {isActive && <View style={{ height: 3, backgroundColor: '#16A34A' }} />}

      <View className="p-4">
        {/* Header Row */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1.5 flex-wrap gap-2">
              {/* Status Pill */}
              <View className="flex-row items-center px-2.5 py-0.5 rounded-full" style={{ backgroundColor: status.bg }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.dot, marginRight: 4 }} />
                <Text className="text-xs font-bold" style={{ color: status.color }}>{status.label}</Text>
              </View>
              {/* AI Badge */}
              {item.ai_generated && (
                <View className="flex-row items-center px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EFF6FF' }}>
                  <BrainCircuit size={10} color="#2563EB" />
                  <Text className="text-xs font-bold ml-1" style={{ color: '#2563EB' }}>AI Generated</Text>
                </View>
              )}
            </View>
            <Text className="text-base font-bold" style={{ color: '#0F172A' }}>{item.name}</Text>
          </View>
          <View className="items-center justify-center rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
            <Text className="text-xl font-black" style={{ color: '#2563EB' }}>{item.discount_percent}%</Text>
            <Text className="text-xs" style={{ color: '#94A3B8' }}>OFF</Text>
          </View>
        </View>

        {/* Coupon Code */}
        <View className="flex-row items-center mb-4 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' }}>
          <Tag size={13} color="#64748B" />
          <Text className="text-sm font-mono font-bold ml-2" style={{ color: '#0F172A' }}>{item.coupon_code}</Text>
        </View>

        {/* Meta Row */}
        <View className="flex-row justify-between flex-wrap gap-2">
          <View className="flex-row items-center">
            <MapPin size={13} color="#94A3B8" />
            <Text className="text-xs ml-1.5" style={{ color: '#64748B' }}>{item.region}</Text>
          </View>
          <View className="flex-row items-center">
            <CalendarDays size={13} color="#94A3B8" />
            <Text className="text-xs ml-1.5" style={{ color: '#64748B' }}>From {item.start_date}</Text>
          </View>
          <View className="flex-row items-center">
            <Users size={13} color="#94A3B8" />
            <Text className="text-xs ml-1.5" style={{ color: '#64748B' }}>{item.orders_used} orders</Text>
          </View>
        </View>

        {/* Projected Impact */}
        {item.projected_impact && item.projected_impact !== 'TBD' && (
          <View className="mt-3 px-3 py-2 rounded-xl flex-row items-center" style={{ backgroundColor: '#F0FDF4' }}>
            <Sparkles size={13} color="#16A34A" />
            <Text className="text-xs font-semibold ml-2" style={{ color: '#16A34A' }}>
              Projected Impact: {item.projected_impact}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Summary Bar ─────────────────────────────────────────────────────────────

const SummaryBar = () => {
  const active = CAMPAIGNS_MOCK.filter((c) => c.status === 'active').length;
  const aiGenerated = CAMPAIGNS_MOCK.filter((c) => c.ai_generated).length;
  const totalOrders = CAMPAIGNS_MOCK.reduce((acc, c) => acc + c.orders_used, 0);

  return (
    <View className="mx-5 mb-4 rounded-2xl p-4 flex-row justify-between" style={{ backgroundColor: '#1E293B' }}>
      {[
        { label: 'Active', value: active, color: '#4ADE80' },
        { label: 'AI Created', value: `${aiGenerated}/${CAMPAIGNS_MOCK.length}`, color: '#60A5FA' },
        { label: 'Total Orders', value: totalOrders, color: '#FDBA74' },
      ].map((stat) => (
        <View key={stat.label} className="items-center">
          <Text className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</Text>
          <Text className="text-xs" style={{ color: '#94A3B8' }}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

const STATUS_TABS = ['All', 'active', 'scheduled', 'ended'];

export const CampaignsScreen = () => {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = useMemo(() =>
    activeTab === 'All' ? CAMPAIGNS_MOCK : CAMPAIGNS_MOCK.filter((c) => c.status === activeTab),
    [activeTab]
  );

  return (
    <ScreenWrapper noPadding>
      {/* Header */}
      <View className="px-5 pt-6 pb-3">
        <Text className="text-2xl font-bold mb-0.5" style={{ color: '#0F172A' }}>Campaigns</Text>
        <Text className="text-sm" style={{ color: '#64748B' }}>AI-managed regional promotions</Text>
      </View>

      {/* Summary */}
      <SummaryBar />

      {/* Status Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} className="mb-4">
        {STATUS_TABS.map((tab) => (
          <FilterChip
            key={tab}
            label={tab === 'All' ? 'All' : STATUS_CONFIG[tab]?.label || tab}
            active={activeTab === tab}
            onPress={() => setActiveTab(tab)}
          />
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CampaignCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Megaphone size={40} color="#CBD5E1" />
            <Text className="mt-3 text-sm" style={{ color: '#94A3B8' }}>No campaigns in this category</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
};
