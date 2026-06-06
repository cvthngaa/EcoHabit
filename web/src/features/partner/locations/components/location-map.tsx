import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location, LocationCapabilityType } from '../../../../shared/domain';
import {
  STATUS_LABEL,
  STATUS_COLOR,
  CAPABILITY_LABEL,
} from '../../../../shared/domain';

// Fix Leaflet default marker icons broken by bundlers (Vite/Webpack)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green marker for APPROVED locations, grey for others
const makeIcon = (approved: boolean) =>
  new L.Icon({
    iconUrl: approved
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

interface LocationMapProps {
  locations: Location[];
  onViewDetail?: (loc: Location) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ locations, onViewDetail }) => {
  // Only render locations that have valid coordinates
  const mappable = locations.filter(
    (loc) => loc.latitude != null && loc.longitude != null
  );

  // Center on Vietnam by default; if there are points, center on the first one
  const defaultCenter: [number, number] =
    mappable.length > 0
      ? [mappable[0].latitude!, mappable[0].longitude!]
      : [10.7769, 106.7009]; // Ho Chi Minh City

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 520 }}>
      {/* Overlay info when no mappable locations */}
      {mappable.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-2">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm font-semibold text-slate-600">Không có điểm nào có tọa độ</p>
          <p className="text-xs text-slate-400">Thêm vĩ độ / kinh độ khi tạo hoặc sửa điểm thu gom.</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-sm text-xs space-y-1.5">
        <p className="font-bold text-slate-700 mb-1">Chú thích</p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-slate-600">Đã duyệt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0" />
          <span className="text-slate-600">Khác</span>
        </div>
        <div className="border-t border-slate-100 pt-1.5 mt-1.5">
          <span className="text-slate-400">{mappable.length} / {locations.length} điểm có tọa độ</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={mappable.length > 0 ? 13 : 10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mappable.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude!, loc.longitude!]}
            icon={makeIcon(loc.status === 'APPROVED')}
          >
            <Popup minWidth={220} maxWidth={260}>
              <div className="p-1 space-y-2">
                {/* Name + Status */}
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{loc.name}</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${STATUS_COLOR[loc.status]}`}
                  >
                    {STATUS_LABEL[loc.status]}
                  </span>
                </div>



                {/* Address */}
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  📍 {loc.address}
                </div>

                {/* Phone */}
                {loc.contactPhone && (
                  <div className="text-[11px] text-slate-600">
                    📞 {loc.contactPhone}
                  </div>
                )}

                {/* Capabilities */}
                {loc.capabilities && loc.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {loc.capabilities.map((cap: any) => (
                      <span
                        key={cap}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          cap === 'COLLECTION'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {CAPABILITY_LABEL[cap as LocationCapabilityType]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Coordinates */}
                <div className="text-[10px] text-slate-400 font-mono">
                  {loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}
                </div>

                {/* View detail button */}
                {onViewDetail && (
                  <button
                    onClick={() => onViewDetail(loc)}
                    className="w-full mt-1 py-1.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Xem chi tiết →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
