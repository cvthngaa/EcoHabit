import React, { useState } from 'react';
import { FileClock, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminToolbar } from '../../shared/admin-ui';
import { useAdminAuditLogs } from '../services/queries';
import { AdminAuditLogDetailDrawer } from '../components/AdminAuditLogDetailDrawer';
import { formatAuditAction } from '../services/formatters';
import type { AdminAuditLog } from '../services/types';

export const AdminAuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState(''); // Thêm tìm kiếm cơ bản
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [actorEmail, setActorEmail] = useState('');

  // Pass search directly to actorEmail to use ILIKE on backend
  const { data: logsData, isLoading } = useAdminAuditLogs({
    page,
    limit,
    actorEmail: search || undefined,
  });

  const columns: ColumnDef<AdminAuditLog>[] = [
    {
      header: 'Mã log',
      render: (log) => (
        <button 
          onClick={() => setSelectedLogId(log.id)}
          className="text-xs font-mono text-emerald-600 hover:text-emerald-800 hover:underline transition-colors text-left" 
          title="Bấm để xem chi tiết"
        >
          {log.id.split('-')[0]}
        </button>
      ),
    },
    {
      header: 'Người thao tác',
      render: (log) => <span className="font-bold text-slate-800">{log.adminEmail}</span>,
    },
    {
      header: 'Hành động',
      render: (log) => {
        const { label, color } = formatAuditAction(log.action);
        return (
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${color}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Chi tiết (Đối tượng)',
      render: (log) => {
        let targetText = '-';
        if (log.targetUserId) {
          targetText = `User: ${log.targetUserId.split('-')[0]}`;
        }
        
        let metaText = '';
        if (log.metadata) {
          // Trích xuất các thông tin nổi bật từ metadata
          if (log.metadata.name) metaText = log.metadata.name;
          else if (log.metadata.newStatus) metaText = `Trạng thái: ${log.metadata.newStatus}`;
          else if (log.metadata.amount) metaText = `Điểm: ${log.metadata.amount}`;
          else if (log.metadata.rewardId) metaText = `Reward ID: ${String(log.metadata.rewardId).split('-')[0]}`;
        }

        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-800">
              {metaText || targetText}
            </span>
            {metaText && targetText !== '-' && (
              <span className="text-xs font-mono text-slate-500">{targetText}</span>
            )}
            {/* Hiển thị thêm metadata nếu có */}
            {log.metadata && !metaText && (
               <span className="text-xs text-slate-500 max-w-[200px] truncate" title={JSON.stringify(log.metadata)}>
                 {JSON.stringify(log.metadata)}
               </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Thời gian',
      render: (log) => (
        <span className="text-sm text-slate-600 whitespace-nowrap">
          {new Date(log.createdAt).toLocaleString('vi-VN')}
        </span>
      ),
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit logs"
        description="Lịch sử thao tác quản trị mẫu để theo dõi ai đã duyệt, từ chối, sửa quy tắc hoặc thay đổi dữ liệu quan trọng."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
            <FileClock className="h-4 w-4" /> Tải log
          </button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <input
            placeholder="Tìm email hoặc action..."
            value={search}
            onChange={handleSearch}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>
      </div>

      <DataTable 
        data={logsData?.data || []} 
        columns={columns} 
        isLoading={isLoading} 
        containerClassName="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
        pagination={{
          currentPage: page,
          totalPages: logsData?.meta.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />



      {selectedLogId && (
        <AdminAuditLogDetailDrawer 
          logId={selectedLogId} 
          onClose={() => setSelectedLogId(null)} 
        />
      )}
    </div>
  );
};
