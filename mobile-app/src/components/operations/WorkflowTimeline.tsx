import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { CheckCircle2, CircleDashed } from 'lucide-react-native';
import { useAIWorkflowStore, AgentStep } from '../../store/aiWorkflowStore';

const STEPS = [
  { id: 'intake', label: 'Intake Agent' },
  { id: 'insight', label: 'Insight Agent' },
  { id: 'decision', label: 'Decision Agent' },
  { id: 'execution', label: 'Execution Agent' },
];

export const WorkflowTimeline = () => {
  const currentStep = useAIWorkflowStore(state => state.currentStep);

  const getCurrentIndex = () => STEPS.findIndex(s => s.id === currentStep);
  const currentIndex = getCurrentIndex();

  return (
    <View className="p-5 rounded-2xl bg-white" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 }}>AI Workflow Progress</Text>
      <View>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex || (index === 3 && currentStep === 'execution' && !useAIWorkflowStore.getState().isProcessing);
          const isActive = index === currentIndex;

          return (
            <View key={step.id} className="flex-row items-start">
              {/* Timeline dot & line */}
              <View className="items-center mr-4" style={{ width: 24 }}>
                <MotiView
                  animate={{
                    scale: isActive ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 1500,
                    loop: isActive,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={24} color="#16A34A" />
                  ) : isActive ? (
                    <CircleDashed size={24} color="#2563EB" />
                  ) : (
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#E2E8F0', marginTop: 4 }} />
                  )}
                </MotiView>
                {index < STEPS.length - 1 && (
                  <View style={{ width: 2, height: 32, backgroundColor: isCompleted ? '#16A34A' : '#E2E8F0', marginVertical: 4 }} />
                )}
              </View>

              {/* Label */}
              <View className="justify-center" style={{ height: 24 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: isActive || isCompleted ? '700' : '500',
                    color: isActive ? '#2563EB' : isCompleted ? '#0F172A' : '#94A3B8',
                  }}
                >
                  {step.label}
                </Text>
                {isActive && (
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Processing...</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
