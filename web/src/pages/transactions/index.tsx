import React, { useState, useMemo } from 'react';
import {
  History, Search, Calendar, User, CheckCircle2,
  XCircle, Clock, ArrowUpRight, BarChart3,
  RefreshCw, FileText, X, Loader2
} from 'lucide-react';
import { useGetTransactions } from '../../services/locations/use-get-transactions';
import { useVerifyTransaction } from '../../services/locations/use-verify-transaction';
import { useRejectTransaction } from '../../services/locations/use-reject-transaction';
import {
  WASTE_LABEL,
  TX_STATUS_LABEL,
  TX_STATUS_COLOR
} from '../../services/locations/constants';
import type { CollectionTransaction } from '../../services/locations/types';

// ─── Modals ───────────────────────────────────────────────────────────────────

const VerifyModal: React.FC<{ tx: CollectionTransaction; onClose: () => void; onSuccess: () => void }> = ({ tx, onClose, onSuccess }) => {
  const [points, setPoints] = useState('');
  const { mutate, isPending } = useVerifyTransaction();

  const suggested = useMemo(() => {
    let weight = tx.quantityValue || 0;
    if (tx.quantityUnit === 'GRAM') weight = weight / 1000;
    return weight > 0 ? Math.round(weight * 30) : 50;
  }, [tx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(points, 10);
    if (!isNaN(pts) && pts >= 0) {
      mutate({ id: tx.id, pointsAwarded: pts }, { onSuccess });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Xác nhận thu gom
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Người gửi</span>
              <span className="font-semibold text-slate-800">{tx.user?.displayName || 'Ẩn danh'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rác thu gom</span>
              <span className="font-semibold text-slate-800">{tx.wasteType ? WASTE_LABEL[tx.wasteType] : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Khối lượng</span>
              <span className="font-semibold text-slate-800">{tx.quantityValue} {tx.quantityUnit}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Cấp điểm xanh *</label>
            <div className="relative">
              <input
                required type="number" min={0}
                value={points} onChange={e => setPoints(e.target.value)}
                placeholder={`Gợi ý: ${suggested} điểm`}
                className="w-full pl-3 pr-16 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setPoints(String(suggested))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-emerald-100"
              >
                Gợi ý
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Huỷ</button>
            <button type="submit" disabled={isPending || !points} className="flex-1 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl cursor-pointer flex items-center justify-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RejectModal: React.FC<{ tx: CollectionTransaction; onClose: () => void; onSuccess: () => void }> = ({ tx, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const { mutate, isPending } = useRejectTransaction();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      mutate({ id: tx.id, rejectionReason: reason.trim() }, { onSuccess });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600" />
            Từ chối thu gom
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Người gửi</span>
              <span className="font-semibold text-slate-800">{tx.user?.displayName || 'Ẩn danh'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rác thu gom</span>
              <span className="font-semibold text-slate-800">{tx.wasteType ? WASTE_LABEL[tx.wasteType] : '—'}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Lý do từ chối *</label>
            <textarea
              required rows={3}
              value={reason} onChange={e => setReason(e.target.value)}
              placeholder="VD: Rác không đúng phân loại..."
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-rose-400 resize-none transition-all"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Huỷ</button>
            <button type="submit" disabled={isPending || !reason.trim()} className="flex-1 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl cursor-pointer flex items-center justify-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const TransactionsHistory: React.FC = () => {
  const { data: transactions = [], isLoading, refetch } = useGetTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');

  const [verifyTx, setVerifyTx] = useState<CollectionTransaction | null>(null);
  const [rejectTx, setRejectTx] = useState<CollectionTransaction | null>(null);

  // Statistics calculation
  const totalCount = transactions.length;
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const verifiedCount = transactions.filter(t => t.status === 'VERIFIED').length;
  const rejectedCount = transactions.filter(t => t.status === 'REJECTED').length;

  const totalPointsAwarded = transactions
    .filter(t => t.status === 'VERIFIED')
    .reduce((sum, t) => sum + (t.pointsAwarded || 0), 0);

  // Approximate total weight (KG) - simplified
  const totalWeight = transactions
    .filter(t => t.status === 'VERIFIED')
    .reduce((sum, t) => {
      let weight = t.quantityValue || 0;
      if (t.quantityUnit === 'GRAM') {
        weight = weight / 1000;
      }
      return sum + weight;
    }, 0);

  // Filter & Search Logic
  const filteredTransactions = transactions
    .filter((tx) => {
      // Tab filter
      if (activeTab === 'PENDING') return tx.status === 'PENDING';
      if (activeTab === 'VERIFIED') return tx.status === 'VERIFIED';
      if (activeTab === 'REJECTED') return tx.status === 'REJECTED';
      return true;
    })
    .filter((tx) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const userName = tx.user?.displayName || '';
      const userEmail = tx.user?.email || '';
      const locationName = tx.location?.name || '';
      const wasteLabel = tx.wasteType ? WASTE_LABEL[tx.wasteType] : '';

      return (
        userName.toLowerCase().includes(searchLower) ||
        userEmail.toLowerCase().includes(searchLower) ||
        locationName.toLowerCase().includes(searchLower) ||
        wasteLabel.toLowerCase().includes(searchLower)
      );
    })
    // Sort descending by date
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lịch sử thu gom rác thải</h1>
          <p className="text-slate-500 text-sm mt-0.5">Theo dõi lịch sử tiếp nhận rác phân loại và tổng số điểm thưởng đã phát ra</p>
        </div>
        <button
          onClick={() => refetch()}
          title="Tải lại dữ liệu"
          className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer transition-all active:scale-95"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng rác đã thu gom</p>
            <h3 className="text-xl font-extrabold text-slate-950 mt-0.5">{totalWeight.toFixed(1)} KG</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng điểm thưởng phát ra</p>
            <h3 className="text-xl font-extrabold text-slate-950 mt-0.5">{totalPointsAwarded} Điểm</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng số lượt thu gom</p>
            <h3 className="text-xl font-extrabold text-slate-950 mt-0.5">{totalCount} lượt</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ duyệt thành công</p>
            <h3 className="text-xl font-extrabold text-slate-950 mt-0.5">
              {totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(0) : '0'}%
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and search menu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${activeTab === 'PENDING' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-750'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Chờ duyệt ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${activeTab === 'VERIFIED' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-750'
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã duyệt ({verifiedCount})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${activeTab === 'REJECTED' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-750'
              }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Từ chối ({rejectedCount})
          </button>
        </div>

        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo khách hàng, điểm thu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col justify-center items-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-sm text-slate-500">Đang tải lịch sử thu gom...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Người gửi</th>
                  <th className="px-6 py-4 font-semibold">Điểm thu gom</th>
                  <th className="px-6 py-4 font-semibold">Rác tiếp nhận</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {tx.user?.displayName || 'Ẩn danh'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{tx.user?.email || 'N/A'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium text-xs">{tx.location?.name || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">{tx.location?.address}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {tx.wasteType ? WASTE_LABEL[tx.wasteType] : 'Chưa phân loại'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Lượng: <span className="font-semibold text-slate-700">{tx.quantityValue} {tx.quantityUnit}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${TX_STATUS_COLOR[tx.status]}`}>
                        {TX_STATUS_LABEL[tx.status]}
                      </span>
                      {tx.status === 'VERIFIED' && (
                        <div className="mt-1.5">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-bold">
                            +{tx.pointsAwarded} điểm
                          </span>
                        </div>
                      )}
                      {tx.status === 'REJECTED' && (
                        <div className="text-[10px] text-rose-600 italic mt-1.5 max-w-[150px] leading-tight">
                          Lý do: {tx.rejectionReason || 'Không có lý do'}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {tx.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setRejectTx(tx)}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => setVerifyTx(tx)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
                          >
                            Xác nhận
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      Không tìm thấy lịch sử giao dịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {verifyTx && (
        <VerifyModal
          tx={verifyTx}
          onClose={() => setVerifyTx(null)}
          onSuccess={() => { setVerifyTx(null); refetch(); }}
        />
      )}

      {rejectTx && (
        <RejectModal
          tx={rejectTx}
          onClose={() => setRejectTx(null)}
          onSuccess={() => { setRejectTx(null); refetch(); }}
        />
      )}

    </div>
  );
};
