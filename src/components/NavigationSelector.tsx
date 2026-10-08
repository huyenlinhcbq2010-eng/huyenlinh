import React, { useState } from 'react';
import { Lesson, Subject, UserStats } from '../types';
import {
  Laptop,
  Calculator,
  FlaskConical,
  Languages,
  Compass,
  BookOpen,
  CheckCircle2,
  Star,
  Sparkles,
  Layers,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface NavigationSelectorProps {
  grades: number[];
  selectedGrade: number;
  onSelectGrade: (grade: number) => void;
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  lessons: Lesson[];
  selectedLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  userStats: UserStats;
  studentClass?: string;
  onOpenClassModal?: () => void;
}

export const NavigationSelector: React.FC<NavigationSelectorProps> = ({
  grades,
  selectedGrade,
  onSelectGrade,
  subjects,
  selectedSubjectId,
  onSelectSubject,
  lessons,
  selectedLessonId,
  onSelectLesson,
  userStats,
  studentClass,
  onOpenClassModal,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<string>('all');

  const availableSubjects = subjects.filter((s) => s.grade === selectedGrade);
  const subjectLessons = lessons.filter(
    (l) => l.grade === selectedGrade && l.subjectId === selectedSubjectId
  );

  // Grouping by chapter
  const chapters = Array.from(
    new Set(subjectLessons.map((l) => l.chapter).filter(Boolean) as string[])
  );

  const availableLessons =
    selectedChapter === 'all'
      ? subjectLessons
      : subjectLessons.filter((l) => l.chapter === selectedChapter);

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop className="w-4 h-4" />;
      case 'Calculator':
        return <Calculator className="w-4 h-4" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4" />;
      case 'Languages':
        return <Languages className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50/50 border-b-2 border-slate-200 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Row 1: Grade Selection & Student Class Indicator */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-black text-blue-950 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <span>Chương trình:</span>
            </span>
            <div className="btn-3d-blue px-3.5 py-1.5 text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-default">
              <span>Khối Lớp 6</span>
            </div>

            {/* Student Class Badge */}
            {studentClass ? (
              <button
                onClick={() => {
                  sound.playPop();
                  onOpenClassModal?.();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 border border-orange-300 text-orange-900 rounded-xl text-xs font-black transition-all cursor-pointer"
                title="Nhấp để đổi tên lớp"
              >
                <span>Lớp: {studentClass}</span>
                <span className="text-[10px] text-orange-600">✎</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playPop();
                  onOpenClassModal?.();
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-all cursor-pointer animate-pulse"
              >
                + Nhập lớp để ôn tập
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500 hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Học liệu số · Phụ trách: <strong className="text-orange-600">GV: Trương Thị Huyền Linh</strong></span>
          </div>
        </div>

        {/* Row 2: Subject Selector Bar with 3D vibrant Cards */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {availableSubjects.map((subject) => {
            const isSelected = subject.id === selectedSubjectId;
            return (
              <button
                key={subject.id}
                onClick={() => {
                  sound.playPop();
                  onSelectSubject(subject.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-2 border-blue-700 border-b-4 border-b-blue-900 shadow-md transform -translate-y-0.5'
                    : 'bg-white text-slate-700 border-2 border-slate-200 border-b-4 border-b-slate-300 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
              >
                <span className={`p-1 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-600'}`}>
                  {getSubjectIcon(subject.icon)}
                </span>
                <span>{subject.name}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2.5: Chapter / Chương Selector */}
        {chapters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Chương/Chủ đề:</span>
            </span>
            <button
              onClick={() => {
                sound.playPop();
                setSelectedChapter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedChapter === 'all'
                  ? 'btn-3d-blue shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tất cả ({subjectLessons.length} bài)
            </button>
            {chapters.map((ch) => {
              const count = subjectLessons.filter((l) => l.chapter === ch).length;
              const isSelected = selectedChapter === ch;
              return (
                <button
                  key={ch}
                  onClick={() => {
                    sound.playPop();
                    setSelectedChapter(ch);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'btn-3d-blue shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {ch} ({count} bài)
                </button>
              );
            })}
          </div>
        )}

        {/* Row 3: Lesson Selection with 3D Pills & Stars */}
        {availableLessons.length > 0 ? (
          <div className="pt-0.5 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider mr-1 shrink-0">
              Bài học:
            </span>
            {availableLessons.map((lesson) => {
              const isSelected = lesson.id === selectedLessonId;
              const bestScore = userStats.lessonBestScores[lesson.id];
              const isCompleted = bestScore !== undefined && bestScore >= 5;

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    sound.playPop();
                    onSelectLesson(lesson.id);
                  }}
                  className={`group text-left px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-orange-500 text-white border-2 border-orange-600 border-b-4 border-b-orange-800 shadow-sm'
                      : 'bg-white text-slate-700 border-2 border-slate-200 border-b-4 border-b-slate-300 hover:bg-orange-50/50 hover:border-orange-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-amber-200' : 'text-emerald-500'}`} />
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-200 animate-ping' : 'bg-slate-400'}`} />
                  )}
                  <span>{lesson.title}</span>
                  {bestScore !== undefined && (
                    <span className={`ml-1 flex items-center gap-0.5 text-[11px] font-black tabular-nums px-1.5 py-0.5 rounded-lg ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <Star className="w-3 h-3 fill-current text-amber-400" />
                      {bestScore}/10
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-2 text-xs text-slate-500 italic bg-amber-50/70 border border-amber-200 rounded-xl px-3">
            Chưa có bài học nào trong môn này. Thầy/Cô có thể bấm vào nút "Soạn bài (GV: Huyền Linh)" để tạo bài mới.
          </div>
        )}
      </div>
    </div>
  );
};
