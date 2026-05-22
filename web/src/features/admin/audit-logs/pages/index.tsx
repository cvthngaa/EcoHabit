import React from 'react';
import { FileClock } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminToolbar } from '../../shared/admin-ui';
import { auditLogs } from '../../shared/mock-data';

type AuditRow = (typeof auditLogs)[number];

const columns: ColumnDef<AuditRow>[] = [
  { header: 'Mã log', render: (log) => <span className="font-bold text-slate-800">{log.id}</span> },
  { header: 'Người thao tác', render: (log) => log.actor },
  { header: 'Hành động', render: (log) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{log.action}</span> },
  { header: 'Đối tượng', render: (log) => log.target },
  { header: 'Thời gian', render: (log) => log.time },
];

export const AdminAuditLogsPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Audit logs"
      description="Lịch sử thao tác quản trị mẫu để theo dõi ai đã duyệt, từ chối, sửa quy tắc hoặc thay đổi dữ liệu quan trọng."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><FileClock className="h-4 w-4" />Tải log</button>}
    />
    <AdminToolbar placeholder="Tìm actor, action hoặc target..." />
    <DataTable data={auditLogs} columns={columns} />
  </div>
);
