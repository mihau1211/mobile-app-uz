import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import  HeatersScreen from './screens/HeatersScreen';
import ChartsScreen from './screens/ChartsScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (

      <Tab.Navigator>
        
        <Tab.Screen name="Heaters" component={HeatersScreen} />
        <Tab.Screen name="Charts" component={ChartsScreen} />
      </Tab.Navigator>
  
  );
};
export default App;
