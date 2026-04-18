import axios from 'axios';
const API_IP = '192.168.88.134';

export const api = axios.create({
    baseURL: `http://${API_IP}:3000/api`,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});
