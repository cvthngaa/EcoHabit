import { useState } from 'react';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';
import { Modal, Button } from '../../../../shared/components';
import { useGenerateQuizQuestions } from '../services/queries';
import type { QuizDifficulty } from '../services/types';

export const GenerateQuizModal = ({ onClose }: { onClose: () => void }) => {
  const { mutateAsync: generateQuestionsAsync } = useGenerateQuizQuestions();

  interface GenerationConfig {
    id: string;
    topic: string;
    difficulty: QuizDifficulty | '';
    count: number;
  }

  const [configs, setConfigs] = useState<GenerationConfig[]>([
    { id: Date.now().toString(), topic: 'Môi trường chung', difficulty: '', count: 5 },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const validConfigs = configs.filter(c => c.topic.trim().length > 0);
    if (validConfigs.length === 0) return;

    setIsGenerating(true);
    try {
      await Promise.all(
        validConfigs.map((c) =>
          generateQuestionsAsync({
            topic: c.topic,
            difficulty: c.difficulty === '' ? undefined : (c.difficulty as QuizDifficulty),
            count: c.count,
          })
        )
      );
      onClose();
    } catch (error) {
      console.error('Lỗi khi sinh câu hỏi:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddConfig = () => {
    setConfigs([
      ...configs,
      { id: Date.now().toString(), topic: '', difficulty: '', count: 5 },
    ]);
  };

  const handleRemoveConfig = (id: string) => {
    setConfigs(configs.filter((c) => c.id !== id));
  };

  const updateConfig = (id: string, field: keyof GenerationConfig, value: any) => {
    setConfigs(configs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleAutoFill5 = () => {
    const randomTopics = [
      'Phân loại rác thải',
      'Năng lượng tái tạo',
      'Tiết kiệm nước',
      'Biến đổi khí hậu',
      'Động vật hoang dã',
    ];
    setConfigs(
      randomTopics.map((topic, index) => ({
        id: (Date.now() + index).toString(),
        topic,
        difficulty: '',
        count: 5,
      }))
    );
  };

  return (
    <Modal
      title={
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Sinh câu hỏi bằng AI
        </span>
      }
      icon={
        <div className="p-2 bg-purple-50 rounded-xl">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
      }
      onClose={onClose}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full pt-2">
          <button
            onClick={handleAutoFill5}
            disabled={isGenerating}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
            <Sparkles className="h-4 w-4 text-purple-300" />
            <span>Tự động điền 5 bộ</span>
          </button>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isGenerating} className="rounded-xl">
              Hủy
            </Button>
            <Button
              variant="primary"
              leftIcon={isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              onClick={handleGenerate}
              disabled={isGenerating || configs.every(c => !c.topic.trim())}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none shadow-md shadow-purple-500/20"
            >
              {isGenerating ? 'Đang xử lý...' : 'Bắt đầu sinh'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-5 bg-slate-50/50">
        <div className="space-y-4">
          {configs.map((config, index) => (
            <div 
              key={config.id} 
              className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 overflow-hidden"
            >
              {/* Left accent border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {configs.length > 1 && (
                <button
                  onClick={() => handleRemoveConfig(config.id)}
                  disabled={isGenerating}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-all"
                  title="Xóa bộ này"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 sm:col-span-6">
                  <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                      {index + 1}
                    </span>
                    Chủ đề
                  </label>
                  <input
                    value={config.topic}
                    onChange={(e) => updateConfig(config.id, 'topic', e.target.value)}
                    disabled={isGenerating}
                    placeholder="Ví dụ: Phân loại rác..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 focus:bg-white transition-all"
                  />
                </div>
                <div className="col-span-7 sm:col-span-4">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Độ khó
                  </label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => updateConfig(config.id, 'difficulty', e.target.value)}
                    disabled={isGenerating}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Ngẫu nhiên</option>
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
                <div className="col-span-5 sm:col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    SL
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={config.count}
                    onChange={(e) => updateConfig(config.id, 'count', parseInt(e.target.value) || 1)}
                    disabled={isGenerating}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 focus:bg-white transition-all text-center"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddConfig}
          disabled={isGenerating}
          className="group w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <div className="bg-slate-100 rounded-full p-1.5 group-hover:bg-purple-100 transition-colors">
            <Plus className="h-4 w-4" />
          </div>
          Thêm chủ đề khác
        </button>
      </div>

    </Modal>
  );
};
