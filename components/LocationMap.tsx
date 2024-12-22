import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, Button, View, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocationStore } from '@/store/locationStore';

export default function LocationMap() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const locationInterval = useRef<NodeJS.Timeout>();
  const { isTracking, setTracking, addRecord, tempRecords, endSession } = useLocationStore();

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission denied');
      return;
    }
    setTracking(true);
    locationInterval.current = setInterval(async () => {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      addRecord({
        timestamp: location.timestamp,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }, 1000);
  };

  const stopTracking = async () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }
    Alert.prompt('结束运动', '请输入本次运动名称', [
      {
        text: '确定',
        onPress: async (name) => {
          await endSession(name || '未命名');
        },
      },
      { text: '取消', style: 'cancel' },
    ]);
    setTracking(false);
  };

  useEffect(() => {
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, []);

  return (
    <LinearGradient colors={['#0000FF', '#FFFFFF']} style={styles.container}>
      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <Button title="开始运动" onPress={startTracking} />
        ) : (
          <Button title="结束运动" onPress={stopTracking} />
        )}
      </View>

      {location && isTracking && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="当前位置"
          />
          <Polyline
            coordinates={tempRecords.map(r => ({
              latitude: r.latitude,
              longitude: r.longitude,
            }))}
            strokeColor="#000"
            strokeWidth={2}
          />
        </MapView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    marginVertical: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    top: 10,
    zIndex: 1,
    width: '100%',
    alignItems: 'center',
  },
});
