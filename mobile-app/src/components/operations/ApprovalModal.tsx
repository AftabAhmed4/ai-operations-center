import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ShieldAlert, Check, X } from 'lucide-react-native';
import { useAIWorkflowStore } from '../../store/aiWorkflowStore';

export const ApprovalModal = () => {
  const { isAwaitingApproval, approvalData, approveAction, rejectAction } = useAIWorkflowStore();

  if (!isAwaitingApproval) return null;

  return (
    <Modal transparent animationType="slide" visible={isAwaitingApproval}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
        <View className="bg-white rounded-t-3xl p-6 shadow-xl" style={{ borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: '#FEF2F2' }}>
              <ShieldAlert size={24} color="#DC2626" />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>Action Required</Text>
              <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>AI is awaiting your approval</Text>
            </View>
          </View>

          <View className="p-4 rounded-xl mb-6" style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>Proposed Action:</Text>
            <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
              {approvalData?.summary || 'Execute calculated adjustments across selected regions.'}
            </Text>
            
            <View className="flex-row justify-between mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
              <View>
                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>EST. IMPACT</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#16A34A', marginTop: 2 }}>{approvalData?.impact || '+12%'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>RISK LEVEL</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#EA580C', marginTop: 2 }}>{approvalData?.risk || 'Low'}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={rejectAction}
              className="flex-1 py-4 rounded-xl items-center justify-center flex-row"
              style={{ backgroundColor: '#F1F5F9' }}
            >
              <X size={18} color="#64748B" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#64748B', marginLeft: 8 }}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={approveAction}
              className="flex-1 py-4 rounded-xl items-center justify-center flex-row"
              style={{ backgroundColor: '#2563EB', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginLeft: 8 }}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
