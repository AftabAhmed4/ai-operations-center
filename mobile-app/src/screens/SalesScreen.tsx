import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, MapPin, Tag, Package, Store } from 'lucide-react-native';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { productsApi, salesApi } from '../api/endpoints';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar'];
const ORDER_TYPES = ['Walk-in', 'Online Delivery'];

export const SalesScreen = () => {
  const queryClient = useQueryClient();
  
  // Form State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [city, setCity] = useState(CITIES[0]);
  const [orderType, setOrderType] = useState(ORDER_TYPES[0]);
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('0');

  // Fetch Products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const products = productsData?.items || [];

  // Create Sale Mutation
  const createSaleMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      Alert.alert('Success', 'Sale recorded successfully!');
      setQuantity('1');
      setDiscount('0');
      setSelectedProduct(null);
      // Invalidate dashboard and products to reflect inventory drop
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['high-demand'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      Alert.alert('Error', 'Failed to record sale: ' + err.message);
    }
  });

  const handleSubmit = () => {
    if (!selectedProduct) {
      Alert.alert('Validation Error', 'Please select a product.');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity.');
      return;
    }
    
    const disc = parseFloat(discount);
    
    const payload = {
      type: orderType,
      city: city,
      discount_applied: isNaN(disc) ? 0 : disc,
      items: [
        {
          product_id: selectedProduct.id,
          quantity: qty,
          unit_price: selectedProduct.base_price,
        }
      ]
    };

    createSaleMutation.mutate(payload);
  };

  const InputLabel = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <View className="flex-row items-center mb-2 mt-6">
      <Icon size={16} color="#64748B" />
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#475569', marginLeft: 6 }}>{title}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="mb-2">
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A' }}>Point of Sale</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Record live transactions to trigger AI</Text>
        </View>

        {/* Order Type */}
        <InputLabel title="Order Type" icon={Store} />
        <View className="flex-row gap-3">
          {ORDER_TYPES.map(type => (
            <TouchableOpacity 
              key={type} 
              onPress={() => setOrderType(type)}
              className="flex-1 py-3 items-center rounded-xl border"
              style={{ 
                backgroundColor: orderType === type ? '#EFF6FF' : '#FFFFFF',
                borderColor: orderType === type ? '#3B82F6' : '#E2E8F0' 
              }}
            >
              <Text style={{ 
                fontWeight: orderType === type ? '700' : '500', 
                color: orderType === type ? '#2563EB' : '#64748B' 
              }}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* City */}
        <InputLabel title="Location" icon={MapPin} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {CITIES.map(c => (
            <TouchableOpacity 
              key={c} 
              onPress={() => setCity(c)}
              className="py-2 px-5 mr-3 rounded-full border"
              style={{ 
                backgroundColor: city === c ? '#F0FDF4' : '#FFFFFF',
                borderColor: city === c ? '#22C55E' : '#E2E8F0' 
              }}
            >
              <Text style={{ 
                fontWeight: city === c ? '700' : '500', 
                color: city === c ? '#16A34A' : '#64748B' 
              }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product */}
        <InputLabel title="Select Product" icon={Package} />
        {isLoadingProducts ? (
          <ActivityIndicator color="#2563EB" className="py-4" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {products.map((p: any) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <TouchableOpacity 
                  key={p.id} 
                  onPress={() => setSelectedProduct(p)}
                  className="p-4 mr-3 rounded-2xl border"
                  style={{ 
                    width: 160,
                    backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                    borderColor: isSelected ? '#0F172A' : '#E2E8F0' 
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 }} numberOfLines={2}>{p.name}</Text>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>{p.sku}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#2563EB', marginTop: 8 }}>Rs {p.base_price}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Quantity & Discount */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            <InputLabel title="Quantity" icon={ShoppingCart} />
            <TextInput 
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800"
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
          <View className="flex-1">
            <InputLabel title="Discount (Rs)" icon={Tag} />
            <TextInput 
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800"
              keyboardType="numeric"
              value={discount}
              onChangeText={setDiscount}
              placeholder="0.00"
            />
          </View>
        </View>

        {/* Summary & Submit */}
        {selectedProduct && (
          <View className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <View className="flex-row justify-between mb-2">
              <Text style={{ fontSize: 14, color: '#64748B' }}>Subtotal:</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>
                Rs {(selectedProduct.base_price * (parseInt(quantity) || 0)).toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-200">
              <Text style={{ fontSize: 14, color: '#64748B' }}>Discount:</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#EF4444' }}>
                - Rs {parseFloat(discount) || 0}
              </Text>
            </View>
            <View className="flex-row justify-between mb-6">
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Total:</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#2563EB' }}>
                Rs {Math.max(0, (selectedProduct.base_price * (parseInt(quantity) || 0)) - (parseFloat(discount) || 0)).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={createSaleMutation.isPending}
              className="bg-blue-600 rounded-xl py-4 flex-row justify-center items-center"
              style={{ opacity: createSaleMutation.isPending ? 0.7 : 1 }}
            >
              {createSaleMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>Complete Transaction</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
};
