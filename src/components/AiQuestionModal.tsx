import React, { useState } from 'react';
import { Question, Difficulty, Lesson } from '../types';
import { generateAiQuestions } from '../services/aiService';
import { sound } from '../utils/sound';
import { Sparkles, Loader2, Check, X, Plus } from 'lucide-react';

interface AiQuestionModalProps {
  currentLesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onAddGeneratedQuestions: (questions: Question[]) => void;
}

export const AiQuestionModal: React.FC<AiQuestionModalProps> = ({
  currentLesson,
  isOpen,
  onClose,
  onAddGeneratedQuestions,
}) => {
  const [topic, setTopic] = useState<string>(currentLesson.title);
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [count, setCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedList, setGeneratedList] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleGenerate = async () => {
    sound.playPop();
    setIsLoading(true);
    setGeneratedList([]);

    try {
      const questions = await generateAiQuestions({
        topic: topic.trim() || currentLesson.title,
        grade: currentLesson.grade,
        subject: currentLesson.subjectName,
        difficulty: difficulty === 'mixed' ? undefined : difficulty,
        count,
      });

      setGeneratedList(questions);
      // Select all by default
      const initialSelected: Record<string, boolean> = {};
      questions.forEach((q) => {
        initialSelected[q.id] = true;
      });
      setSelectedQuestions(initialSelected);
      sound.playSuccess();
    } catch (e) {
      alert('Không thể tạo câu hỏi tự động. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSelected = () => {
    sound.playPop();
    const toInsert = generatedList.filter((q) => selectedQuestions[q.id]);
    if (toInsert.length > 0) {
      onAddGeneratedQuestions(toInsert);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Trợ lý AI: Gợi ý câu hỏi ôn tập
              </h3>
              <p className="text-xs text-slate-500">
                Sinh bộ câu hỏi sư phạm chuẩn GDPT theo từng mức độ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration inputs */}
        <div className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Chủ đề hoặc nội dung trọng tâm
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Phân biệt Thông tin và Dữ liệu; Tầm quan trọng của thông tin"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phân bố độ khó
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
              >
                <option value="mixed">Đa dạng (Dễ → Khó)</option>
                <option value="easy">Chỉ mức Dễ (Nhận biết)</option>
                <option value="medium">Chỉ mức Trung bình (Thông hiểu)</option>
                <option value="hard">Chỉ mức Khó (Vận dụng)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số lượng câu gợi ý
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
              >
                <option value={3}>3 câu hỏi</option>
                <option value={4}>4 câu hỏi</option>
                <option value={5}>5 câu hỏi</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tổng hợp câu hỏi chuẩn sư phạm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo danh sách câu hỏi ngay</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Preview */}
        {generatedList.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Xem trước câu hỏi đề xuất ({generatedList.length})</span>
              <span className="text-slate-500">Tích chọn các câu muốn thêm</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {generatedList.map((q) => {
                const isChecked = !!selectedQuestions[q.id];
                return (
                  <div
                    key={q.id}
                    onClick={() =>
                      setSelectedQuestions((prev) => ({
                        ...prev,
                        [q.id]: !prev[q.id],
                      }))
                    }
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer space-y-1.5 ${
                      isChecked
                        ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-400'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              q.difficulty === 'easy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.difficulty === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <span>{q.prompt}</span>
                        </div>
                        <div className="text-slate-600">
                          <strong>Đáp án:</strong> {q.correctAnswer}
                        </div>
                        <div className="text-slate-500 italic">
                          <strong>Giải thích:</strong> {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleInsertSelected}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>
                  Thêm{' '}
                  {
                    generatedList.filter((q) => selectedQuestions[q.id]).length
                  }{' '}
                  câu đã chọn vào bài học
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
