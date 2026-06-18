import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'ecohabit_user_settings';

export interface AppSettings {
 appearance: 'light' | 'nature';
 showLeaves: boolean;
 language: 'vi' | 'en' | 'system';
 notifications: {
 dailyMission: boolean;
 rewardAlert: boolean;
 nearbyPoints: boolean;
 };
 location: {
 preciseLocation: boolean;
 mapReminder: boolean;
 };
}

const defaultSettings: AppSettings = {
 appearance: 'nature',
 showLeaves: false, // false by default for better performance
 language: 'vi',
 notifications: {
 dailyMission: true,
 rewardAlert: true,
 nearbyPoints: false,
 },
 location: {
 preciseLocation: true,
 mapReminder: false,
 },
};

export const loadSettings = async (): Promise<AppSettings> => {
 try {
 const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
 if (jsonValue == null) return defaultSettings;

 const parsed = JSON.parse(jsonValue);

 // Migrate: old 'dark' value is no longer supported – fall back to 'light'
 if (parsed.appearance === 'dark') {
 parsed.appearance = 'light';
 }

 return { ...defaultSettings, ...parsed };
 } catch (e) {
 console.error('Failed to load settings', e);
 return defaultSettings;
 }
};

export const saveSettings = async (settings: Partial<AppSettings>) => {
 try {
 const currentSettings = await loadSettings();
 const newSettings = { ...currentSettings, ...settings };
 await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
 return newSettings;
 } catch (e) {
 console.error('Failed to save settings', e);
 }
};
