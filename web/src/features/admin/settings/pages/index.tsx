import React from 'react';
import { Settings } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminSection, AdminStatCard } from '../../shared/admin-ui';
import { systemSettings } from '../../shared/mock-data';

type SettingRow = (typeof systemSettings)[number];

const columns: ColumnDef<SettingRow>[] = [
  { header: 'Thiết lập', render: (setting) => <span className="font-bold text-slate-800">{setting.key}</span> },
  { header: 'Giá trị', render: (setting) => setting.value },
  { header: 'Phạm vi', render: (setting) => setting.scope },
];

export const AdminSettingsPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Cài đặt hệ thống"
      description="Mock settings cho các tham số vận hành quan trọng trước khi nối API cấu hình thật."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Settings className="h-4 w-4" />Lưu thay đổi</button>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AdminStatCard label="Môi trường" value="Demo" change="mock" tone="slate" />
      <AdminStatCard label="Rate limit" value="Bật" change="Redis" tone="emerald" />
      <AdminStatCard label="Audit log" value="Bật" change="required" tone="blue" />
    </div>
    <AdminSection title="Cấu hình mẫu">
      <DataTable
        data={systemSettings}
        columns={columns}
        containerClassName="overflow-hidden rounded-xl border border-slate-200"
      />
    </AdminSection>
  </div>
);
