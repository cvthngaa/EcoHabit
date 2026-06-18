import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadSettings, saveSettings } from '../store/settings.store';

export type AppearanceMode = 'light' | 'nature';
export type LanguageCode = 'vi' | 'en' | 'system';

interface SettingsContextData {
 appearance: AppearanceMode;
 showLeaves: boolean;
 language: LanguageCode;
 updateSettings: (updates: any) => Promise<void>;
 isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextData | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [appearance, setAppearance] = useState<AppearanceMode>('nature');
 const [showLeaves, setShowLeaves] = useState<boolean>(false);
 const [language, setLanguage] = useState<LanguageCode>('vi');
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const init = async () => {
 const settings = await loadSettings();
 setAppearance(settings.appearance as AppearanceMode);
 setShowLeaves(settings.showLeaves);
 setLanguage(settings.language as LanguageCode);
 setIsLoading(false);
 };
 init();
 }, []);

 const updateSettings = async (updates: any) => {
 await saveSettings(updates);
 
 if (updates.appearance !== undefined) setAppearance(updates.appearance);
 if (updates.showLeaves !== undefined) setShowLeaves(updates.showLeaves);
 if (updates.language !== undefined) setLanguage(updates.language);
 };

 return (
 <SettingsContext.Provider value={{ appearance, showLeaves, language, updateSettings, isLoading }}>
 {children}
 </SettingsContext.Provider>
 );
};

export const useSettings = () => {
 const context = useContext(SettingsContext);
 if (!context) {
 throw new Error('useSettings must be used within a SettingsProvider');
 }
 return context;
};
