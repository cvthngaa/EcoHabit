import api from './api/interceptor';

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

type BackendCollectionPoint = {
  id: string;
  name?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  type?: string | null;
  status?: string | null;
};

export type Coordinate = {
  latitude: number;
  longitude: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(from: Coordinate, to: Coordinate) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

function mapTypeToLabel(type?: string | null) {
  if (!type) return 'Tong hop';

  switch (type) {
    case 'COLLECTION_POINT':
      return 'Tong hop';
    case 'RECYCLING_CENTER':
      return 'Trung tam tai che';
    default:
      return type.replace(/_/g, ' ');
  }
}

function toCoordinateNumber(value?: number | string | null) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function getNearbyCollectionPoints(
  coordinate: Coordinate,
): Promise<CollectionPointItem[]> {
  try {
    console.log('[locationService] requesting /collection-points with coordinate:', coordinate);
    const response = await api.get<BackendCollectionPoint[]>('/collection-points', {
      params: {
        lat: coordinate.latitude,
        lng: coordinate.longitude,
        radius: 10,
      },
    });
    const points = Array.isArray(response.data) ? response.data : [];
  const invalidCoordinatePoints = points.filter(point => {
    const latitude = toCoordinateNumber(point.latitude);
    const longitude = toCoordinateNumber(point.longitude);

    return latitude === null || longitude === null;
  });

  console.log('[locationService] /collection-points response count:', points.length);
  console.log(
    '[locationService] invalid coordinate points:',
    invalidCoordinatePoints.map(point => ({
      id: point.id,
      name: point.name,
      latitude: point.latitude,
      longitude: point.longitude,
      status: point.status,
    })),
  );

  return points
    .map(point => ({
      ...point,
      latitude: toCoordinateNumber(point.latitude),
      longitude: toCoordinateNumber(point.longitude),
    }))
    .filter(
      (
        point,
      ): point is BackendCollectionPoint & {
        latitude: number;
        longitude: number;
      } => point.latitude !== null && point.longitude !== null,
    )
    .map(point => {
      const distanceKm = calculateDistanceKm(coordinate, {
        latitude: point.latitude,
        longitude: point.longitude,
      });

      return {
        id: point.id,
        name: point.name?.trim() || 'Diem thu gom',
        address: point.address?.trim() || 'Chua co dia chi',
        lat: point.latitude,
        lng: point.longitude,
        open: point.status === 'APPROVED',
        distanceKm,
        distanceLabel: formatDistance(distanceKm),
        types: mapTypeToLabel(point.type),
        hours: 'Lien he diem thu gom',
        phone: '1900 000 000',
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
  } catch (error: any) {
    console.log('[locationService] /collection-points request failed');
    console.log('[locationService] error message:', error?.message);
    console.log('[locationService] error code:', error?.code);
    console.log('[locationService] error status:', error?.response?.status);
    console.log('[locationService] error data:', error?.response?.data);
    throw error;
  }
}
