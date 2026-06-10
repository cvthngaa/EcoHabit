import React, { useState, useRef } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Loader2 } from 'lucide-react';
import type { TrashClassification, WasteType, BinType } from '../services';

interface ReviewModalProps {
  classification: TrashClassification;
  onClose: () => void;
  onSubmit: (data: { correctedLabel: string; correctedWasteType: WasteType; correctedBin: BinType; correctedBoundingBox?: number[]; reviewNote: string }) => void;
  isSubmitting: boolean;
}

const WASTE_TYPES: { value: WasteType; label: string }[] = [
  { value: 'PLASTIC', label: 'Nhựa' },
  { value: 'PAPER', label: 'Giấy' },
  { value: 'BATTERY', label: 'Pin' },
  { value: 'GLASS', label: 'Thuỷ tinh' },
  { value: 'METAL', label: 'Kim loại' },
  { value: 'E_WASTE', label: 'Rác điện tử' },
  { value: 'TEXTILE', label: 'Vải/Quần áo' },
  { value: 'OTHER', label: 'Khác' },
];

const BIN_TYPES: { value: BinType; label: string }[] = [
  { value: 'BIN', label: 'Thùng rác' },
  { value: 'CENTER', label: 'Trung tâm xử lý/quyên góp' },
  { value: 'COLLECTION_POINT', label: 'Điểm thu gom' },
];

const inputCls = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all';

const BoundingBoxEditor = ({ imageUrl, value, onChange }: { imageUrl: string, value?: number[], onChange: (val: number[]) => void }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<number[] | undefined>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setStartPos({ x, y });
    setIsDrawing(true);
    setCurrentBox([x, y, x, y]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    const xmin = Math.min(startPos.x, x);
    const ymin = Math.min(startPos.y, y);
    const xmax = Math.max(startPos.x, x);
    const ymax = Math.max(startPos.y, y);
    
    setCurrentBox([xmin, ymin, xmax, ymax]);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (currentBox) {
      onChange(currentBox);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-slate-100 rounded-lg overflow-hidden touch-none select-none cursor-crosshair mb-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <img src={imageUrl} alt="Trash" className="w-full h-auto block pointer-events-none" />
      {currentBox && (
        <div 
          className="absolute border-2 border-rose-500 bg-rose-500/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
          style={{
            left: `${currentBox[0] * 100}%`,
            top: `${currentBox[1] * 100}%`,
            width: `${(currentBox[2] - currentBox[0]) * 100}%`,
            height: `${(currentBox[3] - currentBox[1]) * 100}%`,
          }}
        />
      )}
      <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
        Kéo thả để vẽ vùng nhận diện
      </div>
    </div>
  );
};

export const ReviewModal: React.FC<ReviewModalProps> = ({ classification, onClose, onSubmit, isSubmitting }) => {
  const [correctedLabel, setCorrectedLabel] = useState(classification.predictedLabel || '');
  const [correctedWasteType, setCorrectedWasteType] = useState<WasteType>(classification.predictedWasteType || 'OTHER');
  const [correctedBin, setCorrectedBin] = useState<BinType>(classification.suggestedBin || 'BIN');
  const [correctedBoundingBox, setCorrectedBoundingBox] = useState<number[] | undefined>(classification.correctedBoundingBox || classification.resultJson?.boundingBox);
  const [reviewNote, setReviewNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ correctedLabel, correctedWasteType, correctedBin, correctedBoundingBox, reviewNote });
  };

  return (
    <Modal
      title="Sửa kết quả AI (Correct)"
      onClose={onClose}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !correctedLabel}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-sm shadow-emerald-600/20"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Xác nhận sửa
          </button>
        </div>
      }
    >
      <div className="p-6">
        <BoundingBoxEditor 
          imageUrl={classification.imageUrl} 
          value={correctedBoundingBox} 
          onChange={setCorrectedBoundingBox} 
        />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Nhãn sửa đổi <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={correctedLabel}
              onChange={(e) => setCorrectedLabel(e.target.value)}
              className={inputCls}
              placeholder="VD: Chai nhựa trong suốt..."
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Loại rác</label>
            <select
              value={correctedWasteType}
              onChange={(e) => setCorrectedWasteType(e.target.value as WasteType)}
              className={inputCls}
            >
              {WASTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Loại thùng</label>
            <select
              value={correctedBin}
              onChange={(e) => setCorrectedBin(e.target.value as BinType)}
              className={inputCls}
            >
              {BIN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Ghi chú kiểm duyệt</label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Ghi chú lý do thay đổi..."
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};
