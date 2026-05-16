import React from 'react';
import { View, Text } from 'react-native';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';

export const OperationsCenterScreen = () => {
  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl font-bold text-text">Operations Center</Text>
      </View>
    </ScreenWrapper>
  );
};
