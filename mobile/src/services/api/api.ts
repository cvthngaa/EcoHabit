import axios from 'axios';
import Constants from 'expo-constants';

const getLocalIp = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }
  return 'localhost';
};

const API_IP = getLocalIp();

export const api = axios.create({
  baseURL: `http://${API_IP}:3000/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
