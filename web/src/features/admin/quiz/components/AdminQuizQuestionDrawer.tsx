import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { useUpdateQuizQuestion, useDeleteQuizQuestion } from '../services/queries';
import { IconButton, Button } from '../../../../shared/components';
import type { QuizQuestion, QuizDifficulty, QuizOption } from '../services/types';

export const AdminQuizQuestionDrawer = ({
  question,
  onClose,
}: {
  question: QuizQuestion;
  onClose: () => void;
}) => {
  const { mutate: updateQuestion, isPending: isUpdating } = useUpdateQuizQuestion();
  const { mutate: deleteQuestion, isPending: isDeleting } = useDeleteQuizQuestion();

  const [topic, setTopic] = useState(question.topic);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(question.difficulty);
  const [content, setContent] = useState(question.content);
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [options, setOptions] = useState<QuizOption[]>(question.options || []);

  useEffect(() => {
    setTopic(question.topic);
    setDifficulty(question.difficulty);
    setContent(question.content);
    setExplanation(question.explanation || '');
    setOptions(question.options || []);
  }, [question]);

  const handleSave = () => {
    updateQuestion(
      {
        id: question.id,
        dto: {
          topic,
          difficulty,
          content,
          explanation,
          options: options.map((opt, idx) => ({
            content: opt.content,
            isCorrect: opt.isCorrect,
            sortOrder: idx,
          })),
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.')) {
      deleteQuestion(question.id, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { id: Date.now().toString(), content: '', isCorrect: false, sortOrder: options.length }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: keyof QuizOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right sm:w-[540px] border-l border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chi tiết Câu hỏi</h2>
            <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {question.id.split('-')[0]}</p>
          </div>
          <IconButton onClick={onClose} icon={<X />} variant="ghost" size="sm" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Chủ đề</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Độ khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              >
                <option value="easy">Dễ (Easy)</option>
                <option value="medium">Trung bình (Medium)</option>
                <option value="hard">Khó (Hard)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nội dung câu hỏi</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Giải thích (tuỳ chọn)</label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Các lựa chọn (Đáp án)</label>
                <button onClick={handleAddOption} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Thêm
                </button>
              </div>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const newOptions = options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                        setOptions(newOptions);
                      }}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <input
                      value={opt.content}
                      onChange={(e) => handleOptionChange(idx, 'content', e.target.value)}
                      className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-slate-400"
                      placeholder={`Lựa chọn ${idx + 1}`}
                    />
                    <IconButton
                      icon={<Trash2 className="h-4 w-4 text-rose-500" />}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(idx)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-between items-center gap-2">
          <Button 
            variant="danger" 
            leftIcon={<Trash2 />} 
            onClick={handleDelete} 
            isLoading={isDeleting}
            disabled={isUpdating}
          >
            Xóa
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isUpdating || isDeleting}>
              Hủy
            </Button>
            <Button variant="primary" leftIcon={<Save />} onClick={handleSave} isLoading={isUpdating} disabled={isDeleting}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
