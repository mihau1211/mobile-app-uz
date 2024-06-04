import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const Chart = ({ heater, refreshData }: { heater: any, refreshData: any }) => {
  const [name, setName] = useState('');
  const [temperatureArray, setTemperatureArray] = useState([]);
  const [timestampArray, setTimestampArray] = useState([]);

  const fetchMonitoringData = async (id: number) => {
    try {
      const response = await fetch(`http://192.168.184.112:3100/api/v1/monitoringData/furnace/${id}?range=day`);
      const data = await response.json();
      
      if (data.furnace) {
        const furnace = data.furnace;
        setName(furnace.name);
      }
      if (data.monitoringData) {
        const monitoringDataValues = data.monitoringData.map(item => item.temperature)
        setTemperatureArray(monitoringDataValues)
        const monitoringDataTimestamp = data.monitoringData.map(item => {
          const date = new Date(item.timestamp);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        });
        setTimestampArray(monitoringDataTimestamp)
      }
    } catch (error) {
      console.error('Failed to fetch heater data:', error);
    }
  }

  useEffect(() => {
    if (heater.id) {
      fetchMonitoringData(heater.id);
    }
  }, [heater.id, refreshData]);



  const chartData = {
    labels: timestampArray,
    datasets: [
      {
        data: temperatureArray,
        strokeWidth: 2, // optional
      },
    ],
  };

  return (
    <View style={{ padding: 30, borderBottomColor: '#ccc', borderBottomWidth: 1 }}>
      <Text>{name}</Text>
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
  const [furnaces, setFurnaces] = useState<object[] | null>(null);
  const [refreshData, setRefreshData] = useState(0);


  useEffect(() => {
    const fetchFurnaces = async () => {
      try {
        const response = await fetch('http://192.168.184.112:3100/api/v1/furnace/owner/1');
        const data = await response.json();
        setFurnaces(data.furnaces);
      } catch (error) {
        console.error('Failed to fetch furnaces:', error);
      }
    };

    fetchFurnaces(); // Fetch immediately on mount

    const intervalId = setInterval(() => {
      setRefreshData(prev => prev + 1); // Update state to trigger re-render
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  const heaters = furnaces?.filter(row => row.isFanOn).map(row => ({ id: row.id })) || [];

  return (
      <View>
        {heaters.map((heater) => (
          <Chart key={heater.id.toString()} heater={heater} refreshData={refreshData} />
        ))}
        <FlatList
          data={heaters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Chart heater={item} refreshData={refreshData} />}
        />
      </View>
  );
};

export default ChartsScreen;