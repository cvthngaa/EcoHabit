import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { DataTable, Button, type ColumnDef } from '../../../../shared/components';
import { AdminPageHeader, AdminStatCard, AdminToolbar, StatusPill } from '../../shared/admin-ui';
import { useAdminCollectionPoints } from '../services/queries';
import type { Location } from '../services/types';

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
          
          <AdminToolbar 
            placeholder="Tìm điểm thu gom, đối tác..." 
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          
          <DataTable 
            data={filteredData} 
            columns={columns} 
          />
        </>
      )}
    </div>
  );
};
