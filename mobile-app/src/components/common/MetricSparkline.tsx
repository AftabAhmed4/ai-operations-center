import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface MetricSparklineProps {
  data: number[];
  color?: string;
}

export const MetricSparkline = ({ data, color = '#2563EB' }: MetricSparklineProps) => {
  const chartData = data.map((value) => ({ value }));

  return (
    <View style={{ overflow: 'hidden', borderRadius: 8 }}>
      <LineChart
        data={chartData}
        width={100}
        height={40}
        color={color}
        thickness={2}
        hideDataPoints
        hideAxesAndRules
        areaChart
        startFillColor={color}
        endFillColor={'transparent'}
        startOpacity={0.2}
        endOpacity={0}
        initialSpacing={0}
        endSpacing={0}
        curved
      />
    </View>
  );
};
