import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationRecord {
  timestamp: number;
  latitude: number;
  longitude;
  sessionName?: string;
}

interface LocationStore {
  sessions: Record<string, LocationRecord[]>;
  tempRecords: LocationRecord[];
  isTracking: boolean;
  addRecord: (record: LocationRecord) => void;
  setTracking: (status: boolean) => void;
  clearRecords: () => void;
  exportToCSV: () => Promise<void>;
  saveRecordsToLocalStorage: () => Promise<void>;
  loadRecordsFromLocalStorage: () => Promise<void>;
  endSession: (name: string) => Promise<void>;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  sessions: {},
  tempRecords: [],
  isTracking: false,
  addRecord: (record) => set((state) => ({
    tempRecords: [...state.tempRecords, record]
  })),
  setTracking: (status) => set({ isTracking: status }),
  clearRecords: () => set({ tempRecords: [] }),
  exportToCSV: async () => {
    const records = get().tempRecords;
    if (!records.length) return;
    const csvContent = records
      .map(r => `${r.timestamp},${r.latitude},${r.longitude}`)
      .join('\n');
    const fileUri = FileSystem.documentDirectory + 'records.csv';
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    await Sharing.shareAsync(fileUri);
  },
  saveRecordsToLocalStorage: async () => {
    const sessions = get().sessions;
    await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
  },
  loadRecordsFromLocalStorage: async () => {
    const stored = await AsyncStorage.getItem('sessions');
    if (stored) {
      set({ sessions: JSON.parse(stored) });
    }
  },
  endSession: async (name: string) => {
    set((state) => ({
      sessions: { ...state.sessions, [name]: [...state.tempRecords] },
      tempRecords: [],
      isTracking: false
    }));
    await get().saveRecordsToLocalStorage();
  },
}));
