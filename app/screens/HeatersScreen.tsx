import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const HeaterItem = ({ heater }: { heater: any }) => {
  const [fanOn, setFanOn] = useState(heater.fanOn);

  useEffect(() => {
    if (heater.temperature > 100) {
      Alert.alert('Warning', `${heater.name} temperature is over 100°C!`);
    }
  }, [heater.temperature]);

  const handlePress = () => {
    setFanOn(!fanOn);
  };

  return (
    <View style={{ padding: 20, borderBottomColor: '#ccc', borderBottomWidth: 1 }}>
      <Text style={{ fontSize: 20 }}>{heater.name}</Text>
      <Text>Temperature: {heater.temperature}°C</Text>
      <Text>Humidity: {heater.humidity}%</Text>
      <Button title={fanOn ? 'Stop Fan' : 'Start Fan'} onPress={handlePress} />
    </View>
  );
};

export const HeatersScreen = () => {
  const [data, setData] = useState<number[] | null>(null);
  useEffect(() => {
    fetch('http://www.randomnumberapi.com/api/v1.0/random?min=100&max=1000&count=5') // Replace this with your own API
      .then(response => response.json())
      .then(data => setData(data));
  }, []);
  const heaters = [];
  if(data !== null) {
  for (let i = 0; i < (data as number[]).length; i++) {
    heaters[i] = {name: 'Heater ' + i, temperature: data ? data[i] : null, humidity: data ? data[i]/10 : null, fanOn: false};
  };
  }

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <FlatList
        data={heaters}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <HeaterItem heater={item} />}
      />
    </View>
  );
};
export default HeatersScreen;