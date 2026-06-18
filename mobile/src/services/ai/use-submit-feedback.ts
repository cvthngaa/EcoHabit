import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { SuggestedBin, WasteType } from './types';

export type SubmitAiFeedbackPayload = {
 classificationId: string;
 isCorrect: boolean;
 correctedLabel?: string;
 correctedWasteType?: WasteType;
 correctedBin?: SuggestedBin;
 note?: string;
};

export function useSubmitAiFeedback() {
 return useMutation({
 mutationFn: async ({ classificationId, ...payload }: SubmitAiFeedbackPayload) => {
 const response = await api.post<{ message: string }>(
 `/ai/feedback/${classificationId}`,
 payload,
 );

 return response.data;
 },
 });
}
