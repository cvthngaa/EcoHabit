import React from 'react';
import { MapPin } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, AdminToolbar, StatusPill } from '../../shared/admin-ui';
import { locations } from '../../shared/mock-data';

type LocationRow = (typeof locations)[number];

const columns: ColumnDef<LocationRow>[] = [
  { header: 'Điểm thu gom', render: (location) => <div><p className="font-bold text-slate-800">{location.name}</p><p className="text-xs text-slate-500">{location.partner}</p></div> },
  { header: 'Loại', render: (location) => location.type },
  { header: 'Khối lượng', render: (location) => `${location.kg.toLocaleString('vi-VN')} kg`, className: 'text-right font-bold' },
  { header: 'Giao dịch', render: (location) => location.transactions, className: 'text-right' },
  { header: 'Trạng thái', render: (location) => <StatusPill status={location.status} /> },
];

export const AdminLocationsPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Điểm thu gom"
      description="Xem toàn bộ điểm thu gom của hệ thống, trạng thái duyệt, loại điểm và hiệu quả thu gom."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><MapPin className="h-4 w-4" />Duyệt điểm</button>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <AdminStatCard label="Tổng điểm" value="128" change="+11" tone="blue" />
      <AdminStatCard label="Đang hoạt động" value="102" change="79.6%" tone="emerald" />
      <AdminStatCard label="Chờ duyệt" value="14" change="pending" tone="amber" />
      <AdminStatCard label="Tạm ngưng" value="12" change="inactive" tone="rose" />
    </div>
    <AdminToolbar placeholder="Tìm điểm thu gom, đối tác..." />
    <DataTable data={locations} columns={columns} />
  </div>
);
