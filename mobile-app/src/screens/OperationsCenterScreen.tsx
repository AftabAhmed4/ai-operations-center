import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  Globe, ShieldAlert, PackageSearch,
  TrendingUp, MapPin, Sparkles, BrainCircuit,
  FileText, Image as ImageIcon, UploadCloud
} from 'lucide-react-native';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { WorkflowTimeline } from '../components/operations/WorkflowTimeline';
import { LiveLogs } from '../components/operations/LiveLogs';
import { ApprovalModal } from '../components/operations/ApprovalModal';
import { StateComparisonCard } from '../components/operations/StateComparisonCard';
import { useAIWorkflowStore } from '../store/aiWorkflowStore';
import { workflowsApi } from '../api/endpoints';

const TRIGGER_CARDS = [
  { id: 'news', title: 'Analyze External News', icon: Globe, color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'risk', title: 'Sales Risk Detection', icon: ShieldAlert, color: '#EF4444', bg: '#FEF2F2' },
  { id: 'inventory', title: 'Inventory Analysis', icon: PackageSearch, color: '#EAB308', bg: '#FEFCE8' },
  { id: 'pricing', title: 'Pricing Optimization', icon: TrendingUp, color: '#10B981', bg: '#ECFDF5' },
  { id: 'regional', title: 'Regional Performance', icon: MapPin, color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'campaign', title: 'Campaign Generation', icon: Sparkles, color: '#EC4899', bg: '#FDF2F8' },
];

export const OperationsCenterScreen = () => {
  const queryClient = useQueryClient();
  const { 
    workflowId, isProcessing, triggerWorkflow, 
    addLog, setStep, requireApproval, 
    approvalData, beforeAfterData, finishExecution, reset 
  } = useAIWorkflowStore();

  const handleTrigger = async (cardId: string) => {
    reset();
    triggerWorkflow(cardId);
    
    // Simulate API Call
    const res = await workflowsApi.trigger(cardId);
    useAIWorkflowStore.setState({ workflowId: res.workflow_id });

    // Simulate SSE Streaming
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      if (stepCount === 1) {
        addLog('Connecting to data streams...');
        addLog('Ingesting 450,000 recent data points.');
      } else if (stepCount === 2) {
        setStep('insight');
        addLog('Intake complete. Analyzing patterns...');
        addLog('Identified high-probability velocity drop in Region B.');
      } else if (stepCount === 3) {
        setStep('decision');
        addLog('Simulating 14 parameter changes.');
        addLog('Optimal configuration found: Increase discount by 5%, redistribute inventory.');
      } else if (stepCount === 4) {
        clearInterval(interval);
        requireApproval({
          summary: 'Apply optimal pricing and inventory redistribution to prevent velocity drop.',
          impact: '+14% Revenue',
          risk: 'Low'
        });
      }
    }, 2000);
  };

  // Listen for approval state change to finish execution
  useEffect(() => {
    if (workflowId && !isProcessing && beforeAfterData === null && approvalData) {
      // Meaning it was just approved
      const finalize = async () => {
        addLog('Approval received. Executing changes...');
        const res = await workflowsApi.approve(workflowId, true);
        finishExecution(res);
        addLog('Execution successful. State updated.');
        
        // Invalidate queries so dashboard/products refresh
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      };
      finalize();
    }
  }, [isProcessing, approvalData]);

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A' }}>AI Operations Center</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Autonomous Business Intelligence</Text>
          </View>
          <View className="bg-blue-50 px-3 py-1.5 rounded-full flex-row items-center border border-blue-100">
            <BrainCircuit size={14} color="#2563EB" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB', marginLeft: 4 }}>Live AI</Text>
          </View>
        </View>

        {!workflowId && (
          <>
            {/* Input Area */}
            <View className="mb-8">
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', mb: 12 }}>Data Intake</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-white border border-slate-200 rounded-xl p-4 items-center shadow-sm">
                  <UploadCloud size={20} color="#64748B" />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 8 }}>Upload File</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-white border border-slate-200 rounded-xl p-4 items-center shadow-sm">
                  <FileText size={20} color="#64748B" />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 8 }}>Paste Text</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-white border border-slate-200 rounded-xl p-4 items-center shadow-sm">
                  <ImageIcon size={20} color="#64748B" />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 8 }}>Screenshot</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Trigger Cards */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', mb: 12 }}>Recommended Workflows</Text>
            <View className="flex-row flex-wrap justify-between">
              {TRIGGER_CARDS.map(card => (
                <TouchableOpacity 
                  key={card.id} 
                  onPress={() => handleTrigger(card.id)}
                  className="mb-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
                  style={{ width: '48%' }}
                >
                  <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: card.bg }}>
                    <card.icon size={20} color={card.color} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{card.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {workflowId && (
          <View className="mt-4">
            <WorkflowTimeline />
            <LiveLogs />
            <StateComparisonCard />

            {!isProcessing && beforeAfterData && (
              <TouchableOpacity 
                onPress={reset}
                className="mt-6 bg-blue-600 rounded-xl py-4 items-center shadow-sm"
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>Start New Workflow</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>
      <ApprovalModal />
    </ScreenWrapper>
  );
};
