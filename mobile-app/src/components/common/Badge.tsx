import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge = ({ text, variant = 'info', className = '' }: BadgeProps) => {
  const getStyles = () => {
    switch (variant) {
      case 'success': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'warning': return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'danger': return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'info':
      default: return { bg: 'bg-blue-100', text: 'text-blue-800' };
    }
  };

  const styles = getStyles();

  return (
    <View className={`px-2.5 py-1 rounded-full self-start ${styles.bg} ${className}`}>
      <Text className={`text-xs font-bold ${styles.text}`}>{text}</Text>
    </View>
  );
};
