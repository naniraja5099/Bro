import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomerScreen from '../components/CustomerScreen';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title}</Text>
  </View>
);

export default function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={CustomerScreen} />
      <Tab.Screen name="Book Transport" component={() => <PlaceholderScreen title="Book Transport" />} />
      <Tab.Screen name="Order Food" component={() => <PlaceholderScreen title="Order Food" />} />
      <Tab.Screen name="Check Out" component={() => <PlaceholderScreen title="Check Out" />} />
    </Tab.Navigator>
  );
}
