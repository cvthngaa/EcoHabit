import React, { useState, useMemo } from 'react';
import { MapPin, Map, List } from 'lucide-react';
import { DataTable, Button, type ColumnDef, SearchFilterBar } from '../../../../shared/components';
import { AdminPageHeader, AdminStatCard, StatusPill } from '../../shared/admin-ui';
import { useAdminCollectionPoints } from '../services/queries';
import type { Location } from '../services/types';
import AdminLocationMap from '../components/admin-location-map';

const columns: ColumnDef<Location>[] = [
  { header: 'Điểm thu gom', render: (location) => <div><p className="font-bold text-slate-800">{location.name || 'Không tên'}</p><p className="text-xs text-slate-500">{location.partnerProfile?.organizationName || 'N/A'}</p></div> },
  { header: 'Loại', render: (location) => location.type || 'N/A' },
  { header: 'Khối lượng', render: () => '-', className: 'text-right font-bold text-slate-400' },
  { header: 'Giao dịch', render: () => '-', className: 'text-right text-slate-400' },
  { header: 'Trạng thái', render: (location) => <StatusPill status={location.status || 'PENDING'} /> },
];

export const AdminLocationsPage: React.FC = () => {
  const { data, isLoading, isError } = useAdminCollectionPoints();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredData = useMemo(() => {
    if (!data?.locations) return [];
    if (!searchTerm) return data.locations;

    return data.locations.filter(loc =>
      loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.partnerProfile?.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.locations, searchTerm]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Điểm thu gom"
        description="Xem toàn bộ điểm thu gom của hệ thống, trạng thái duyệt, loại điểm và hiệu quả thu gom."
        action={
          <Button variant="primary" leftIcon={<MapPin />}>
            Duyệt điểm
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-slate-500">Đang tải dữ liệu...</div>
      ) : isError ? (
        <div className="flex h-32 items-center justify-center text-rose-500">Lỗi khi tải dữ liệu. Vui lòng thử lại.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <AdminStatCard label="Tổng điểm" value={data?.stats?.totalLocations.toString() || '0'} change="" tone="blue" />
            <AdminStatCard label="Đang hoạt động" value={data?.stats?.activeLocations.toString() || '0'} change="" tone="emerald" />
            <AdminStatCard label="Chờ duyệt" value={data?.stats?.pendingLocations.toString() || '0'} change="pending" tone="amber" />
            <AdminStatCard label="Loại hình" value={Object.keys(data?.stats?.locationsByType || {}).length.toString()} change="types" tone="indigo" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center justify-between">
            <SearchFilterBar
              searchPlaceholder="Tìm điểm thu gom, đối tác..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <List className="w-3.5 h-3.5" />
                Danh sách
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Map className="w-3.5 h-3.5" />
                Bản đồ
              </button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <AdminLocationMap locations={filteredData} />
          ) : (
            <DataTable
              data={filteredData}
              columns={columns}
            />
          )}
        </>
      )}
    </div>
  );
};
