import api from './api/interceptor';

export type NominatimSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(query: string): Promise<NominatimSuggestion[]> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return [];
  }

  const response = await api.get<NominatimSuggestion[]>('/collection-points/address-suggestions', {
    params: { q: trimmed },
  });

  return Array.isArray(response.data) ? response.data : [];
}
