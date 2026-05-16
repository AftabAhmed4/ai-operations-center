import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button = ({ title, onPress, variant = 'primary', isLoading, disabled, className = '' }: ButtonProps) => {
  const getBgColor = () => {
    if (disabled) return 'bg-gray-300';
    if (variant === 'primary') return 'bg-primary';
    if (variant === 'secondary') return 'bg-white border border-gray-300';
    if (variant === 'danger') return 'bg-danger';
    return 'bg-primary';
  };

  const getTextColor = () => {
    if (disabled) return 'text-gray-500';
    if (variant === 'secondary') return 'text-gray-700';
    return 'text-white';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`py-3 px-4 rounded-xl flex-row justify-center items-center ${getBgColor()} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#0F172A' : '#ffffff'} />
      ) : (
        <Text className={`font-semibold text-base ${getTextColor()}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
