import React from 'react';
import { View, SafeAreaView } from 'react-native';

export const ScreenWrapper = ({ children, noPadding = false }: { children: React.ReactNode, noPadding?: boolean }) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className={`flex-1 ${noPadding ? '' : 'p-4'}`}>
        {children}
      </View>
    </SafeAreaView>
  );
};
