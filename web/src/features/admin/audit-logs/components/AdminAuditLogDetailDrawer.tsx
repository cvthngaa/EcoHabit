import { X, Clock, User, Target, Database, Info } from 'lucide-react';
import { useAdminAuditLogDetail } from '../services/queries';
import { IconButton } from '../../../../shared/components';
import { formatAuditAction, formatMetadataKey } from '../services/formatters';

export const AdminAuditLogDetailDrawer = ({
  logId,
  onClose,
}: {
  logId: string;
  onClose: () => void;
}) => {
  const { data: log, isLoading } = useAdminAuditLogDetail(logId);

  if (isLoading || !log) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[480px]">
        <div className="p-6 text-sm text-slate-500">Đang tải chi tiết log...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[480px] border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chi tiết Audit Log</h2>
            <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {log.id}</p>
          </div>
          <IconButton
            onClick={onClose}
            icon={<X />}
            variant="ghost"
            size="sm"
            aria-label="Đóng chi tiết"
            className="text-slate-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* Action Badge */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-sm font-semibold text-slate-600">Loại thao tác</span>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${formatAuditAction(log.action).color}`}>
              {formatAuditAction(log.action).label}
            </span>
          </div>

          {/* Actor Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-slate-500" /> Người thực hiện (Actor)
            </h3>
            <div className="rounded-xl border border-slate-100 p-4 space-y-2 text-sm bg-slate-50/50">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">{log.adminEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admin ID:</span>
                <span className="font-mono text-slate-600 text-xs">{log.adminId}</span>
              </div>
            </div>
          </div>

          {/* Target Info */}
          {log.targetUserId && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-slate-500" /> Đối tượng bị tác động (Target)
              </h3>
              <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 text-sm">Target User ID:</span>
                  <span className="font-mono text-slate-900 text-sm bg-white p-2 rounded border border-slate-200">
                    {log.targetUserId}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Metadata JSON */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-slate-500" /> Dữ liệu chi tiết (Metadata)
            </h3>
            {log.metadata && Object.keys(log.metadata).length > 0 ? (
              <div className="rounded-xl border border-slate-100 divide-y divide-slate-100 bg-slate-50/50">
                {Object.entries(log.metadata).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:justify-between p-4 gap-2">
                    <span className="text-sm text-slate-500 font-medium">
                      {formatMetadataKey(key)}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 text-right break-words max-w-full sm:max-w-[200px]">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 text-xs text-slate-500 italic text-center">
                Không có dữ liệu đi kèm
              </div>
            )}
          </div>

          {/* Time */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-500" /> Thời gian ghi nhận
            </h3>
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center">
              <span className="text-slate-500 text-sm">Created At:</span>
              <span className="font-semibold text-slate-900">
                {new Date(log.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
