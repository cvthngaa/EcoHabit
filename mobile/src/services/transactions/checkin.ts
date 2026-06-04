import api from '../api/interceptor';

export interface CheckinPayload {
  locationId: string;
  qrToken: string;
  userLatitude: number;
  userLongitude: number;
  acceptedWasteTypeId?: string;
  quantityValue?: number;
  quantityUnit?: string;
}

export async function checkIn(payload: CheckinPayload) {
  try {
    const response = await api.post('/collection-transactions/check-in', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}
