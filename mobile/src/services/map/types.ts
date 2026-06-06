export type CollectionPointItem = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  open: boolean;
  distanceKm: number;
  distanceLabel: string;
  types: string;
  hours: string;
  phone: string;
};

export type BackendCollectionPoint = {
  id: string;
  name?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  collectionProfile?: {
    siteType: string;
  } | null;
  status?: string | null;
};

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type NominatimSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
};
