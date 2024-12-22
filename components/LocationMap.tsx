import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, Button, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { ThemedView } from './ThemedView';
import { useLocationStore } from '@/store/locationStore';

export default function LocationMap() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const locationInterval = useRef<NodeJS.Timeout>();
  const { isTracking, setTracking, addRecord, records } = useLocationStore();

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
    await useLocationStore.getState().saveRecordsToLocalStorage();
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
    <ThemedView style={styles.container}>
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
            coordinates={records.map(r => ({
              latitude: r.latitude,
              longitude: r.longitude,
            }))}
            strokeColor="#000"
            strokeWidth={2}
          />
        </MapView>
      )}
    </ThemedView>
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
