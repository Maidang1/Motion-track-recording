import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationRecord {
  timestamp: number;
  latitude: number;
  longitude;
}

interface LocationStore {
  records: LocationRecord[];
  isTracking: boolean;
  addRecord: (record: LocationRecord) => void;
  setTracking: (status: boolean) => void;
  clearRecords: () => void;
  exportToCSV: () => Promise<void>;
  saveRecordsToLocalStorage: () => Promise<void>;
  loadRecordsFromLocalStorage: () => Promise<void>;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  records: [],
  isTracking: false,
  addRecord: (record) => set((state) => ({ records: [...state.records, record] })),
  setTracking: (status) => set({ isTracking: status }),
  clearRecords: () => set({ records: [] }),
  exportToCSV: async () => {
    const records = get().records;
    if (!records.length) return;
    const csvContent = records
      .map(r => `${r.timestamp},${r.latitude},${r.longitude}`)
      .join('\n');
    const fileUri = FileSystem.documentDirectory + 'records.csv';
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    await Sharing.shareAsync(fileUri);
  },
  saveRecordsToLocalStorage: async () => {
    const records = get().records;
    await AsyncStorage.setItem('records', JSON.stringify(records));
  },
  loadRecordsFromLocalStorage: async () => {
    const stored = await AsyncStorage.getItem('records');
    if (stored) {
      set({ records: JSON.parse(stored) });
    }
  },
}));
