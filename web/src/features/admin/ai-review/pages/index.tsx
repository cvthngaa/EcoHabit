import React, { useState } from 'react';
import { Bot, Check, X, PenLine, Loader2 } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../../shared/components/DataTable';
import { AdminPageHeader, AdminStatCard, ProgressBar } from '../../shared/admin-ui';
import { SearchFilterBar } from '../../../../shared/components/SearchFilterBar';
import { useClassifications } from '../services/queries';
import { useReviewClassification } from '../services/mutations';
import type { ClassificationStatus, TrashClassification, WasteType, BinType } from '../services/api';
import { ReviewModal } from '../components/ReviewModal';

/** Gọi APPROVE / REJECT trực tiếp không qua modal */
const QuickActions = ({
  item,
  onApprove,
  onReject,
  onCorrect,
  isPending,
}: {
  item: TrashClassification;
  onApprove: () => void;
  onReject: () => void;
  onCorrect: () => void;
  isPending: boolean;
}) => {
  if (item.status === 'REVIEWED' || item.reviewedAt) {
    return <span className="text-[11px] text-slate-400 italic">Đã xử lý</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onApprove}
        disabled={isPending}
        title="Duyệt (Approve)"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Duyệt
      </button>
      <button
        onClick={onReject}
        disabled={isPending}
        title="Từ chối (Reject)"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50"
      >
        <X className="w-3 h-3" />
        Từ chối
      </button>
      <button
        onClick={onCorrect}
        disabled={isPending}
        title="Sửa nhãn (Correct)"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
      >
        <PenLine className="w-3 h-3" />
        Sửa nhãn
      </button>
    </div>
  );
};

const statusClass = (status: ClassificationStatus) => {
  if (status === 'SUCCESS' || status === 'REVIEWED') return 'bg-emerald-100 text-emerald-700';
  if (status === 'PENDING') return 'bg-amber-100 text-amber-700';
  if (status === 'FAILED') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
};

const STATUS_OPTIONS: { label: string; value: ClassificationStatus | '' }[] = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đã duyệt', value: 'REVIEWED' },
  { label: 'Thành công', value: 'SUCCESS' },
  { label: 'Thất bại', value: 'FAILED' },
];

export const AdminAiReviewPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ClassificationStatus | ''>('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<TrashClassification | null>(null);

  const { data, isLoading } = useClassifications({
    page,
    limit: 10,
    status: statusFilter,
  });

  const { mutate: submitReview, isPending: isSubmitting } = useReviewClassification();

  const handleQuickAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    submitReview({ id, payload: { action } });
  };

  const handleReviewSubmit = (formData: {
    correctedLabel: string;
    correctedWasteType: WasteType;
    correctedBin: BinType;
    correctedBoundingBox?: number[];
    reviewNote: string;
  }) => {
    if (!selectedItem) return;
    submitReview(
      {
        id: selectedItem.id,
        payload: {
          action: 'CORRECT',
          correctedLabel: formData.correctedLabel,
          correctedWasteType: formData.correctedWasteType,
          correctedBin: formData.correctedBin,
          correctedBoundingBox: formData.correctedBoundingBox,
          reviewNote: formData.reviewNote,
        },
      },
      { onSuccess: () => setSelectedItem(null) }
    );
  };

  const classifications = data?.data ?? [];

  const columns: ColumnDef<TrashClassification>[] = [
    {
      header: 'Ảnh',
      render: (item) => (
        <img
          src={item.imageUrl}
          alt={item.predictedLabel}
          className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=N/A';
          }}
        />
      ),
    },
    {
      header: 'AI dự đoán',
      render: (item) => (
        <span className="font-semibold text-slate-700">{item.predictedLabel}</span>
      ),
    },
    {
      header: 'Confidence',
      render: (item) => (
        <div className="min-w-32">
          <div className="mb-1 text-xs font-bold text-slate-600">
            {Math.round(item.confidence * 100)}%
          </div>
          <ProgressBar
            value={item.confidence * 100}
            color={item.confidence < 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}
          />
        </div>
      ),
    },
    {
      header: 'Feedback',
      render: (item) => {
        const count = item.feedbacks?.length ?? 0;
        return count > 0 ? (
          <span className="text-rose-600 font-medium text-xs bg-rose-50 px-2 py-1 rounded-md">
            {count} báo cáo sai
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Không</span>
        );
      },
    },
    {
      header: 'Trạng thái',
      render: (item) => (
        <span
          className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-full ${statusClass(item.status)}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      render: (item) => (
        <QuickActions
          item={item}
          onApprove={() => handleQuickAction(item.id, 'APPROVE')}
          onReject={() => handleQuickAction(item.id, 'REJECT')}
          onCorrect={() => setSelectedItem(item)}
          isPending={isSubmitting}
        />
      ),
    },
  ];

  const totalReviewed = classifications.filter((c) => c.status === 'REVIEWED').length;
  const lowConfidence = classifications.filter((c) => c.confidence < 0.7).length;
  const withFeedback = classifications.filter((c) => (c.feedbacks?.length ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kiểm duyệt AI"
        description="Quản lý và tinh chỉnh kết quả phân loại từ AI. Tập trung vào các ảnh có độ tin cậy thấp hoặc bị người dùng báo cáo sai nhãn."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm">
            <Bot className="h-4 w-4" />
            Duyệt mẫu
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatCard
          label="Tổng lượt phân loại"
          value={(data?.total ?? 0).toLocaleString('vi-VN')}
          change="Toàn thời gian"
          tone="blue"
        />
        <AdminStatCard
          label="Confidence thấp (<70%)"
          value={lowConfidence.toString()}
          change="Trang hiện tại"
          tone="amber"
        />
        <AdminStatCard
          label="Bị báo cáo sai"
          value={withFeedback.toString()}
          change="Ưu tiên cao"
          tone="rose"
        />
        <AdminStatCard
          label="Đã duyệt"
          value={totalReviewed.toString()}
          change="Trang hiện tại"
          tone="emerald"
        />
      </div>

      <SearchFilterBar
        searchPlaceholder="Tìm theo nhãn AI dự đoán..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            key: 'status',
            value: statusFilter,
            onChange: (val) => {
              setStatusFilter(val as ClassificationStatus | '');
              setPage(1);
            },
            options: STATUS_OPTIONS,
          },
        ]}
      />

      <DataTable
        data={classifications}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="Không có dữ liệu phân loại"
        emptyDescription="Chưa có lượt phân loại nào hoặc không khớp bộ lọc."
        pagination={
          data && data.totalPages > 1
            ? {
                currentPage: data.page,
                totalPages: data.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      {selectedItem && (
        <ReviewModal
          classification={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
