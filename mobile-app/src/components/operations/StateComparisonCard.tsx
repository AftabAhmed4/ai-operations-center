import React from 'react';
import { View, Text } from 'react-native';
import { ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useAIWorkflowStore } from '../../store/aiWorkflowStore';

export const StateComparisonCard = () => {
  const beforeAfterData = useAIWorkflowStore(state => state.beforeAfterData);

  if (!beforeAfterData) return null;

  return (
    <View className="mt-6 p-5 rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: '#16A34A' }}>
      <View className="flex-row items-center mb-4">
        <CheckCircle2 size={20} color="#16A34A" />
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#16A34A', marginLeft: 8 }}>Action Executed Successfully</Text>
      </View>

      <Text style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
        {beforeAfterData.summary || 'The optimized parameters have been applied. Expected changes:'}
      </Text>

      <View className="rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
        <View className="flex-row bg-slate-50 py-2 px-4 border-b border-slate-200">
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#64748B' }}>METRIC</Text>
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'center' }}>BEFORE</Text>
          <View style={{ width: 24 }} />
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'right' }}>AFTER</Text>
        </View>

        {(beforeAfterData.metrics || []).map((item: any, index: number) => (
          <View key={index} className="flex-row py-3 px-4 items-center bg-white" style={{ borderBottomWidth: index < beforeAfterData.metrics.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: '#0F172A' }}>{item.label}</Text>
            <Text style={{ flex: 1, fontSize: 13, color: '#64748B', textAlign: 'center' }}>{item.before}</Text>
            <View style={{ width: 24, alignItems: 'center' }}>
              <ArrowRight size={14} color="#CBD5E1" />
            </View>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#16A34A', textAlign: 'right' }}>{item.after}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
