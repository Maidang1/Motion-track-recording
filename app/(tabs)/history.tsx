import { View, StyleSheet, Button, FlatList, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocationStore } from '@/store/locationStore';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function HistoryScreen() {
  const { sessions, exportToCSV, loadRecordsFromLocalStorage } = useLocationStore();

  useEffect(() => {
    loadRecordsFromLocalStorage();
  }, []);


  return (
    <LinearGradient colors={['#0000FF', '#FFFFFF']} style={styles.container}>
      <FlatList
        data={Object.entries(sessions)}
        keyExtractor={([date]) => date}
        renderItem={({ item: [date, dayRecords] }) => (
          <View style={styles.dateGroup}>
            <ThemedText type="subtitle">{date}</ThemedText>
            <ThemedText>
              记录点数: {dayRecords.length}
              总时长: {((dayRecords[dayRecords.length - 1].timestamp - dayRecords[0].timestamp) / 1000 / 60).toFixed(1)}分钟
            </ThemedText>
          </View>
        )}
      />
      <Button title="导出数据" onPress={exportToCSV} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {},
  dateGroup: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});
