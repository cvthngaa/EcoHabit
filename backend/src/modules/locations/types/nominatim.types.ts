export interface NominatimSuggestion {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}

export interface NominatimItem {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: NominatimAddress;
}

export interface NominatimAddress {
  road?: string;
  suburb?: string;
  city?: string;
  town?: string;
  state?: string;
  country?: string;
}
