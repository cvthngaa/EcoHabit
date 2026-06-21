import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { mapClassificationResponse } from './ai.mapper';
import { createClassificationFormData } from './ai.utils';
import { BackendClassificationResponse } from './types';

const CLASSIFICATION_TIMEOUT_MS = 20000;

function logClassificationResult(data: BackendClassificationResponse): void {
 if (!__DEV__) return;

 console.log('[AI Service] Classification result', {
 isOverloaded: data.isOverloaded,
 resultsCount: data.results?.length,
 });
}

export function useClassifyWaste() {
 return useMutation({
 mutationFn: async ({ imageUri, latitude, longitude }: { imageUri: string; latitude?: number; longitude?: number }) => {
 const response = await api.post<BackendClassificationResponse>(
 '/ai/classify',
 createClassificationFormData(imageUri, latitude, longitude),
 {
 headers: {
 'Content-Type': 'multipart/form-data',
 },
 timeout: CLASSIFICATION_TIMEOUT_MS,
 },
 );

 logClassificationResult(response.data);

 if (!response.data.results || response.data.results.length === 0) {
 throw new Error(response.data.message || 'Không tìm thấy rác thải nào trong ảnh.');
 }

 return mapClassificationResponse(response.data);
 },
 });
}
