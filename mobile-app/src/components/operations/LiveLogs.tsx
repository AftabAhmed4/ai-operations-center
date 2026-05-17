import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useAIWorkflowStore } from '../../store/aiWorkflowStore';

export const LiveLogs = () => {
  const logs = useAIWorkflowStore(state => state.logs);
  const flatListRef = useRef<FlatList>(null);

  return (
    <View className="rounded-2xl overflow-hidden mt-6" style={{ backgroundColor: '#0F172A', height: 200, borderWidth: 1, borderColor: '#334155' }}>
      <View className="flex-row items-center justify-between px-4 py-2" style={{ backgroundColor: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#334155' }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>Terminal Execution</Text>
        <View className="flex-row gap-1.5">
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#EAB308' }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' }} />
        </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={logs}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row mb-2">
            <Text style={{ color: '#4ADE80', fontSize: 12, fontFamily: 'monospace', marginRight: 8 }}>[{item.timestamp}]</Text>
            <Text style={{ color: '#F8FAFC', fontSize: 12, fontFamily: 'monospace', flex: 1 }}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
};
