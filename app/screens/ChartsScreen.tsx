import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const Chart = ({ heater }: { heater: any }) => {
    const chartData = {
      labels: ['1', '2', '3', '4', '5'],
      datasets: [
        {
          data: heater.temperatureData,
          strokeWidth: 2, // optional
        },
      ],
    };

    return (
      <View style={{ padding: 30, borderBottomColor: '#ccc', borderBottomWidth: 1 }}>
        <Text>{heater.name}</Text>
        <LineChart
          data={chartData}
          width={320}
          height={220}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };
  
  const ChartsScreen = () => {
    const [data, setData] = useState<number[] | null>(null);
    useEffect(() => {
      fetch('http://www.randomnumberapi.com/api/v1.0/random?min=100&max=1000&count=5') // Replace this with your own API
        .then(response => response.json())
        .then(data => setData(data));
    }, []);
    const label = [];
    const values = [];
    if(data !== null) {
        for( let i = 0; i < (data as number[]).length; i++) {
      label[i]= new Date().toLocaleTimeString(); 
      values[i] = {name: 'Heater ' + i, temperatureData: data[i] ? data : null};
        };
    }
    const heaters = [
      // For each heater, add an object with the heater name and temperature data
      
      { name: 'Heater 0', temperatureData: [99, 80, 60, 92, 110, ] },
      { name: 'Heater 1', temperatureData: [21, 22, 23, 24, 25, 26] },
      { name: 'Heater 2', temperatureData: [20, 21, 22, 23, 24, 25] },
      { name: 'Heater 3', temperatureData: [24, 25, 26, 27, 28, 29] },
      { name: 'Heater 4', temperatureData: [22, 23, 24, 25, 26, 27] },
      // Add more heaters herea
    ];
  
    return (
      <ScrollView>
        <View>
          {heaters.map((heater) => (
            <Chart key={heater.name} heater={heater} />
          ))}
        </View>
      </ScrollView>
    );
  };

export default ChartsScreen;