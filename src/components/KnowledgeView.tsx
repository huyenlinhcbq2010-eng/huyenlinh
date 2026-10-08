import React, { useState } from 'react';
import { Lesson, Difficulty } from '../types';
import { TeacherAvatar } from './TeacherAvatar';
import {
  Brain,
  Database,
  HardDrive,
  Lightbulb,
  CheckCircle,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  Award,
  Zap,
  Target,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface KnowledgeViewProps {
  lesson: Lesson;
  onStartQuiz: (difficulty?: Difficulty | 'all') => void;
  onOpenTeacherEdit?: () => void;
  isTeacherMode: boolean;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  lesson,
  onStartQuiz,
  onOpenTeacherEdit,
  isTeacherMode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'situations' | 'flashcards'>('overview');
  const [knowledgeLevel, setKnowledgeLevel] = useState<'all' | 'medium' | 'hard'>('all');
  const [activeFlashcard, setActiveFlashcard] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const mediumQuestionsCount = lesson.questions.filter((q) => q.difficulty === 'medium').length;
  const hardQuestionsCount = lesson.questions.filter((q) => q.difficulty === 'hard').length;

  // Text to speech handler
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ đọc giọng nói tự động.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${lesson.title}. Biên soạn bởi Giáo viên Trương Thị Huyền Linh. Mục tiêu bài học: ${lesson.objectives.join(
      '. '
    )}. Kiến thức cần nhớ: ${lesson.keyConcepts
      .map((c) => `${c.title}. Định nghĩa: ${c.definition}`)
      .join('. ')}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const getConceptIcon = (name?: string) => {
    switch (name) {
      case 'Brain':
        return <Brain className="w-6 h-6 text-blue-600" />;
      case 'Database':
        return <Database className="w-6 h-6 text-orange-600" />;
      case 'HardDrive':
        return <HardDrive className="w-6 h-6 text-emerald-600" />;
      case 'Lightbulb':
        return <Lightbulb className="w-6 h-6 text-amber-500" />;
      default:
        return <BookOpen className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 3D Glossy Hero Banner with Blue & Orange Contrast */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 border-2 border-blue-600 border-b-6 border-b-blue-950 p-6 sm:p-8 shadow-xl text-white overflow-hidden">
        {/* 3D Glossy Light Highlights */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-3xl" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-400/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Badges with Teacher Attribution */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-white font-extrabold text-xs border border-white/30 shadow-xs">
                Khối {lesson.grade} · {lesson.subjectName}
              </span>

              {/* Teacher name prominent badge with Avatar */}
              <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-2xl bg-orange-500 text-white font-black text-xs border-b-2 border-orange-700 shadow-sm">
                <TeacherAvatar size="sm" showBadge={false} />
                <span>GV: Trương Thị Huyền Linh</span>
              </div>

              {lesson.isCustom && (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px]">
                  Bài biên soạn mới
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              {lesson.title}
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed font-medium">
              {lesson.subtitle}
            </p>
          </div>

          {/* 3D Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Audio Speech Button */}
            <button
              onClick={handleToggleSpeak}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white border-b-4 border-rose-700 animate-pulse'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/30 border-b-4 border-b-blue-950 shadow-md'
              }`}
              title={isSpeaking ? 'Dừng đọc' : 'Đọc to kiến thức bài học'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Dừng đọc' : 'Nghe cô đọc'}</span>
            </button>

            {/* CTA 3D Orange Button: Start Quiz with difficulty options */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  sound.playPop();
                  onStartQuiz('all');
                }}
                className="btn-3d-orange flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-lg cursor-pointer transform hover:scale-102"
              >
                <Zap className="w-4 h-4 fill-amber-200 text-amber-200" />
                <span>Luyện tập tất cả ({lesson.questions.length} câu)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 justify-center">
                <button
                  onClick={() => {
                    sound.playPop();
                    onStartQuiz('medium');
                  }}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-[11px] font-black text-white transition-all cursor-pointer flex items-center gap-1"
                  title="Luyện tập câu hỏi mức độ Trung bình"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Trung bình ({mediumQuestionsCount})</span>
                </button>
                <button
                  onClick={() => {
                    sound.playPop();
                    onStartQuiz('hard');
                  }}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-[11px] font-black text-white transition-all cursor-pointer flex items-center gap-1"
                  title="Luyện tập câu hỏi mức độ Khó / Vận dụng"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Khó ({hardQuestionsCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Objectives ("Sau bài này em sẽ...") */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/15">
            <div className="text-xs font-black text-orange-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-300" />
              <span>Mục tiêu bài học cần đạt (Sau bài này em sẽ):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-blue-50">
              {lesson.objectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-black/10 backdrop-blur-xs p-2 rounded-xl border border-white/10">
                  <CheckCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sub-Tabs for Study Mode with 3D Pills */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            sound.playPop();
            setActiveTab('overview');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'btn-3d-blue shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kiến thức cốt lõi & So sánh</span>
        </button>

        {lesson.practicalSituations && lesson.practicalSituations.length > 0 && (
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('situations');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'situations'
                ? 'btn-3d-orange shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Tình huống thực tế SGK ({lesson.practicalSituations.length})</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playPop();
            setActiveTab('flashcards');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'flashcards'
              ? 'btn-3d-blue shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Thẻ 3D ghi nhớ nhanh ({lesson.keyConcepts.length})</span>
        </button>

        {isTeacherMode && onOpenTeacherEdit && (
          <button
            onClick={onOpenTeacherEdit}
            className="ml-auto text-xs font-black text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 border-b-4 border-b-orange-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            Chỉnh sửa nội dung này
          </button>
        )}
      </div>

      {/* TAB 1: OVERVIEW & CORE CONCEPTS (3D Cards) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Difficulty / Knowledge Level Selector Bar */}
          <div className="bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-orange-100 text-orange-700">
                <Target className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Tùy chọn mức độ kiến thức:
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Lọc kiến thức trọng tâm theo mức độ tiếp thu
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  sound.playPop();
                  setKnowledgeLevel('all');
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  knowledgeLevel === 'all'
                    ? 'btn-3d-blue shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Tất cả ({lesson.keyConcepts.length})
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setKnowledgeLevel('medium');
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  knowledgeLevel === 'medium'
                    ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Trung bình</span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setKnowledgeLevel('hard');
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  knowledgeLevel === 'hard'
                    ? 'bg-rose-600 text-white border-2 border-rose-700 shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Khó / Vận dụng</span>
              </button>
            </div>
          </div>

          {/* Key Concept Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {lesson.keyConcepts
              .filter((c) => {
                if (knowledgeLevel === 'all') return true;
                return (c.level || 'medium') === knowledgeLevel;
              })
              .map((concept, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={concept.id}
                    className={`bg-white border-2 ${
                      isEven ? 'border-blue-200 border-b-6 border-b-blue-300' : 'border-orange-200 border-b-6 border-b-orange-300'
                    } rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all space-y-3.5`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${isEven ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'} shadow-inner`}>
                          {getConceptIcon(concept.iconName)}
                        </div>
                        <div>
                          <span className={`text-[11px] font-black uppercase tracking-wider ${isEven ? 'text-blue-600' : 'text-orange-600'}`}>
                            Mục kiến thức {index + 1}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            {concept.title}
                          </h3>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shrink-0 ${
                        concept.level === 'hard'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {concept.level === 'hard' ? 'Khó' : 'Trung bình'}
                      </span>
                    </div>

                  {/* Definition Highlight Box */}
                  <div className={`rounded-2xl p-4 text-xs sm:text-sm font-semibold leading-relaxed border ${
                    isEven
                      ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                      : 'bg-orange-50/70 border-orange-200 text-orange-950'
                  }`}>
                    {concept.definition}
                  </div>

                  {/* Examples */}
                  {concept.examples && concept.examples.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <span>Ví dụ minh họa:</span>
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700 pl-1 font-medium">
                        {concept.examples.map((ex, i) => (
                          <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pedagogical Note */}
                  {concept.note && (
                    <div className="text-[11px] text-slate-600 bg-amber-50/80 rounded-xl p-2.5 border border-amber-200 font-medium">
                      💡 <strong className="text-amber-900">Cô Huyền Linh lưu ý:</strong> {concept.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Comparison Table with 3D Depth */}
          {lesson.comparisonTable && (
            <div className="bg-white border-2 border-slate-200 border-b-6 border-b-slate-300 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Bảng phân biệt và so sánh cốt lõi</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Ghi nhớ bản chất, không bị nhầm lẫn giữa Thông tin · Dữ liệu · Vật mang tin
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-slate-100">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-slate-200 text-blue-950 font-black">
                      {lesson.comparisonTable.headers.map((h, i) => (
                        <th key={i} className="p-3.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100">
                    {lesson.comparisonTable.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-3.5 font-black text-blue-700 whitespace-nowrap">
                          {row.concept}
                        </td>
                        <td className="p-3.5 text-slate-800 font-bold">{row.nature}</td>
                        <td className="p-3.5 text-slate-600 font-medium">{row.role}</td>
                        <td className="p-3.5 text-slate-700 italic bg-amber-50/30 font-medium">
                          {row.example}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom 3D Callout to Quiz */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 border-2 border-orange-600 border-b-6 border-b-orange-800 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-base sm:text-lg font-black text-white flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Em đã sẵn sàng thử thách kiến thức chưa?</span>
              </div>
              <p className="text-xs sm:text-sm text-orange-100 font-medium">
                Hãy luyện tập ngay bộ câu hỏi từ dễ đến khó do GV Trương Thị Huyền Linh biên soạn!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  sound.playPop();
                  onStartQuiz('medium');
                }}
                className="px-4 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-700 border-b-4 border-b-emerald-900 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                Mức Trung bình ({mediumQuestionsCount} câu)
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  onStartQuiz('hard');
                }}
                className="px-4 py-2.5 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 border-b-4 border-b-rose-900 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                Mức Khó ({hardQuestionsCount} câu)
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  onStartQuiz('all');
                }}
                className="px-5 py-2.5 text-xs sm:text-sm font-black bg-white text-orange-700 hover:bg-orange-50 border-2 border-white border-b-4 border-b-orange-200 rounded-xl shadow-md transition-all cursor-pointer shrink-0 transform hover:scale-105 active:translate-y-1 whitespace-nowrap"
              >
                Làm tất cả 20 câu 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRACTICAL SITUATIONS */}
      {activeTab === 'situations' && lesson.practicalSituations && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl p-4 text-xs text-blue-900 font-medium flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Các tình huống thực tế trích từ SGK giúp học sinh liên hệ sâu sắc giữa bài học với cuộc sống.
              Phương pháp giáo dục của Cô Huyền Linh: <strong>"Học mà chơi – Hiểu để vận dụng"</strong>.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {lesson.practicalSituations.map((sit, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-200 border-b-6 border-b-slate-300 rounded-3xl p-5 sm:p-6 shadow-md space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center border-b-2 border-orange-700 shadow-xs">
                    {idx + 1}
                  </span>
                  <h4 className="text-base font-black text-slate-900">{sit.title}</h4>
                </div>

                <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs sm:text-sm text-slate-800">
                  <strong className="text-blue-900 block mb-1 font-black">Tình huống thực tế:</strong>
                  {sit.scenario}
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 text-xs sm:text-sm text-emerald-950 font-medium">
                  <strong className="text-emerald-900 block mb-1 font-black">Phân tích bài học:</strong>
                  {sit.insight}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 3D REALISTIC INTERACTIVE FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="space-y-5">
          <div className="text-center text-xs font-bold text-slate-500">
            Chạm hoặc nhấp vào thẻ để lật xoay 3D xem định nghĩa và lời giảng!
          </div>

          {/* Flashcard 3D container */}
          <div className="max-w-xl mx-auto perspective-1000">
            {lesson.keyConcepts.length > 0 && (
              <div
                onClick={() => {
                  sound.playPop();
                  setIsFlipped(!isFlipped);
                }}
                className={`min-h-[280px] p-8 rounded-3xl border-2 border-b-6 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xl select-none transform hover:scale-[1.02] ${
                  isFlipped
                    ? 'bg-gradient-to-br from-orange-600 via-orange-700 to-amber-700 text-white border-orange-500 border-b-orange-900'
                    : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-blue-500 border-b-blue-950'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-100">
                    Thẻ {activeFlashcard + 1} / {lesson.keyConcepts.length}
                  </span>
                  <span
                    className={`font-black px-2.5 py-1 rounded-xl shadow-xs ${
                      isFlipped ? 'bg-amber-400 text-slate-950' : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    {isFlipped ? 'Mặt sau: Định nghĩa chi tiết' : 'Mặt trước: Khái niệm'}
                  </span>
                </div>

                <div className="py-6 text-center space-y-3">
                  {!isFlipped ? (
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center mx-auto mb-3 shadow-md">
                        {getConceptIcon(lesson.keyConcepts[activeFlashcard].iconName)}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                        {lesson.keyConcepts[activeFlashcard].title}
                      </h3>
                      <p className="text-xs text-blue-200 mt-2 font-medium">
                        (Nhấn vào đây để xoay thẻ xem định nghĩa)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-left">
                      <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        Định nghĩa bài học:
                      </div>
                      <p className="text-sm sm:text-base text-white leading-relaxed font-semibold">
                        {lesson.keyConcepts[activeFlashcard].definition}
                      </p>
                      {lesson.keyConcepts[activeFlashcard].examples && (
                        <div className="text-xs text-orange-100 pt-2 border-t border-orange-400/40">
                          <strong>Ví dụ:</strong> {lesson.keyConcepts[activeFlashcard].examples[0]}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-blue-200 font-bold">
                  {isFlipped ? 'Chạm để quay lại mặt trước' : 'Chạm để lật xoay 3D'}
                </div>
              </div>
            )}

            {/* Flashcard navigation controls */}
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => {
                  sound.playPop();
                  setIsFlipped(false);
                  setActiveFlashcard((prev) =>
                    prev > 0 ? prev - 1 : lesson.keyConcepts.length - 1
                  );
                }}
                className="btn-3d-white px-4 py-2 text-xs font-black rounded-xl cursor-pointer"
              >
                ← Thẻ trước
              </button>

              <div className="flex items-center gap-2">
                {lesson.keyConcepts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sound.playPop();
                      setIsFlipped(false);
                      setActiveFlashcard(i);
                    }}
                    className={`h-3 rounded-full transition-all cursor-pointer ${
                      activeFlashcard === i ? 'bg-orange-500 w-7' : 'bg-slate-300 w-3'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  setIsFlipped(false);
                  setActiveFlashcard((prev) =>
                    prev < lesson.keyConcepts.length - 1 ? prev + 1 : 0
                  );
                }}
                className="btn-3d-white px-4 py-2 text-xs font-black rounded-xl cursor-pointer"
              >
                Thẻ tiếp →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
