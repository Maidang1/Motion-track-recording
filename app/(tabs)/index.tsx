import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LocationMap from '@/components/LocationMap';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Your Current Location</ThemedText>
      <LocationMap />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },

});
