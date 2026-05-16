import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, BrainCircuit, Package, Tags, DollarSign, LineChart } from 'lucide-react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { OperationsCenterScreen } from '../screens/OperationsCenterScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { CampaignsScreen } from '../screens/CampaignsScreen';
import { SalesScreen } from '../screens/SalesScreen';
import { ReportsScreen } from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="AI Center" 
        component={OperationsCenterScreen} 
        options={{ tabBarIcon: ({ color }) => <BrainCircuit color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen} 
        options={{ tabBarIcon: ({ color }) => <Package color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Campaigns" 
        component={CampaignsScreen} 
        options={{ tabBarIcon: ({ color }) => <Tags color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Sales" 
        component={SalesScreen} 
        options={{ tabBarIcon: ({ color }) => <DollarSign color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ tabBarIcon: ({ color }) => <LineChart color={color} size={24} /> }}
      />
    </Tab.Navigator>
  );
};
