import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { mapClassificationResponse } from './ai.mapper';
import { createClassificationFormData } from './ai.utils';
import { BackendClassificationResponse } from './types';

const CLASSIFICATION_TIMEOUT_MS = 20000;

function logClassificationResult(data: BackendClassificationResponse): void {
  if (!__DEV__) return;

  console.log('[AI Service] Classification result', {
    classificationId: data.classificationId,
    label: data.label,
    wasteType: data.wasteType,
    pointsEarned: data.pointsEarned,
    awarded: data.awarded,
    balanceAfter: data.balanceAfter,
  });
}

export function useClassifyWaste() {
  return useMutation({
    mutationFn: async (imageUri: string) => {
      const response = await api.post<BackendClassificationResponse>(
        '/ai/classify',
        createClassificationFormData(imageUri),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: CLASSIFICATION_TIMEOUT_MS,
        },
      );

      logClassificationResult(response.data);

      return mapClassificationResponse(response.data);
    },
  });
}
