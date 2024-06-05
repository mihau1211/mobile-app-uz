import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, Modal, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const Chart = ({ heater, refreshData }: { heater: any, refreshData: any }) => {
  const [name, setName] = useState('');
  const [temperatureArray, setTemperatureArray] = useState<number[]>([]);
  const [timestampArray, setTimestampArray] = useState([]);

  const fetchMonitoringData = async (id: number) => {
    try {

      const response = await fetch(`http://192.168.184.112:3100/api/v1/monitoringData/furnace/${id}?range=5min`);
      const data = await response.json();

      if (data.data.furnace) {
        const furnace = data.data.furnace;
        setName(furnace.name);
      }
      if (data.data.monitoringData) {
        const monitoringData = data.data.monitoringData
        const monitoringDataValues = monitoringData.map((item: { temperature: any; }) => item.temperature)
        setTemperatureArray(monitoringDataValues)

        const monitoringDataTimestamp = monitoringData.map((item: { timestamp: string | number | Date; }) => {
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
      {temperatureArray.length > 0 && timestampArray.length > 0 && (
        <LineChart
          data={chartData}
          width={370}
          height={520}
          verticalLabelRotation={90}
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
      )}
      {/* <LineChart
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
      /> */}
    </View>
  );
};

const HeaterItem = ({ heater, refreshData }: { heater: any, refreshData: any }) => {
  const [name, setName] = useState('');
  const [temperature, setTemperature] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [fanOn, setFanOn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchHeaterData = async (id: number) => {
    if (fanOn) {
      try {
        const response = await fetch(`http://192.168.184.112:3100/api/v1/monitoringData/furnace/avg/${id}`);
        const data = await response.json();
        if (data.furnace) {
          const furnace = data.furnace;
          setName(furnace.name);
          setFanOn(furnace.isFanOn);
          setDateFrom(furnace.dateFrom);
        }
        if (data.average) {
          setTemperature(data.average[0].average_temperature);
        }
        if (data.dateFrom) {
          setDateFrom(new Date(data.dateFrom).toTimeString())
        }
      } catch (error) {
        console.error('Failed to fetch heater data:', error);
      }
    }
  };

  useEffect(() => {
    if (heater.id) {
      fetchHeaterData(heater.id);
    }
  }, [heater.id, refreshData]);

  useEffect(() => {
    if (temperature > 100) {
      Alert.alert('Warning', `${name} temperature is over 100°C!`);
    }
  }, [temperature]);

  const handlePress = async () => {
    await fetch(`http://192.168.184.112:3100/api/v1/furnace/fanState/${heater.id}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: !fanOn })
    });
    setFanOn(!fanOn);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={{ padding: 20, borderBottomColor: '#ccc', borderBottomWidth: 1 }}>
      <Text>{name} - {fanOn ? 'Enabled' : 'Disabled'}</Text>
      <Text>Temperature (average): {temperature !== null ? temperature : '0'}°C</Text>
      <Text>Date range: {dateFrom}</Text>
      <Button title={fanOn ? 'Stop Fan' : 'Start Fan'} onPress={handlePress} />
      {fanOn ? <Button title={'Chart'} onPress={toggleModal} /> : <></>}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ marginTop: 50 }}>
          <View>
            <Chart heater={heater} refreshData={refreshData} />
            <Button title="Hide Chart" onPress={toggleModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const HeatersScreen = () => {
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

  const heaters = furnaces?.map(row => ({ id: row.id })) || [];

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <FlatList
        data={heaters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HeaterItem heater={item} refreshData={refreshData} />}
      />
    </View>
  );
};
export default HeatersScreen;