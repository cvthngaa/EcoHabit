import { useMutation } from '@tanstack/react-query';
import api from '../api-client';

type UploadImageResponse = {
 success: boolean;
 url: string;
};

function getFileNameFromUri(uri: string): string {
 const parts = uri.split('/');
 return parts[parts.length - 1] || `avatar-${Date.now()}.jpg`;
}

function getMimeTypeFromUri(uri: string): string {
 const lower = uri.toLowerCase();
 if (lower.endsWith('.png')) return 'image/png';
 if (lower.endsWith('.webp')) return 'image/webp';
 return 'image/jpeg';
}

export function createImageFormData(imageUri: string): FormData {
 const formData = new FormData();

 formData.append('file', {
 uri: imageUri,
 name: getFileNameFromUri(imageUri),
 type: getMimeTypeFromUri(imageUri),
 } as unknown as Blob);

 return formData;
}

export function useUploadImage() {
 return useMutation({
 mutationFn: async (imageUri: string): Promise<UploadImageResponse> => {
 const response = await api.post<UploadImageResponse>(
 '/uploads/image',
 createImageFormData(imageUri),
 {
 headers: {
 'Content-Type': 'multipart/form-data',
 },
 timeout: 20000,
 },
 );

 return response.data;
 },
 });
}
