import React from 'react';
import { MessageSquareWarning } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, AdminToolbar, StatusPill } from '../../shared/admin-ui';

type ForumReportRow = { id: string; post: string; reporter: string; reason: string; status: string; };

const forumReports: ForumReportRow[] = [];

const columns: ColumnDef<ForumReportRow>[] = [
  { header: 'Bài viết', render: (report) => <span className="font-bold text-slate-800">{report.post}</span> },
  { header: 'Báo cáo', render: (report) => report.reporter },
  { header: 'Lý do', render: (report) => report.reason },
  { header: 'Trạng thái', render: (report) => <StatusPill status={report.status as any} /> },
];

export const AdminForumPage: React.FC = () => (
  <div className="space-y-6">
    <AdminPageHeader
      title="Forum"
      description="Kiểm duyệt bài viết, bình luận và báo cáo cộng đồng bằng dữ liệu mẫu."
      action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><MessageSquareWarning className="h-4 w-4" />Duyệt báo cáo</button>}
    />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AdminStatCard label="Bài viết hôm nay" value="84" change="+12" tone="blue" />
      <AdminStatCard label="Báo cáo mở" value="6" change="open" tone="rose" />
      <AdminStatCard label="Đã xử lý" value="51" change="tuần này" tone="emerald" />
    </div>
    <AdminToolbar placeholder="Tìm bài viết hoặc lý do báo cáo..." />
    <DataTable data={forumReports} columns={columns} />
  </div>
);
