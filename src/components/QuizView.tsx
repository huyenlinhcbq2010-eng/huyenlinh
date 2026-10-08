import React, { useState, useEffect } from 'react';
import { Lesson, Question, Difficulty, QuizAttemptRecord } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { TeacherAvatar } from './TeacherAvatar';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Star,
  Award,
  HelpCircle,
  Flame,
  Check,
  Send,
  BookOpen,
  Zap,
  Users,
  GraduationCap,
} from 'lucide-react';

interface QuizViewProps {
  lesson: Lesson;
  onFinishQuiz: (record: QuizAttemptRecord) => void;
  onBackToKnowledge: () => void;
  studentClass?: string;
  studentName?: string;
  onOpenClassModal?: () => void;
  onSetStudentClass?: (studentClass: string, studentName?: string) => void;
  initialDifficulty?: Difficulty | 'all';
}

export const QuizView: React.FC<QuizViewProps> = ({
  lesson,
  onFinishQuiz,
  onBackToKnowledge,
  studentClass,
  studentName,
  onOpenClassModal,
  onSetStudentClass,
  initialDifficulty = 'all',
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>(initialDifficulty);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (initialDifficulty) {
      setSelectedDifficulty(initialDifficulty);
    }
  }, [initialDifficulty]);

  // Quick class state when class is not provided yet
  const [tempClass, setTempClass] = useState<string>('');
  const [tempName, setTempName] = useState<string>('');
  const [classError, setClassError] = useState<string>('');

  // User input states
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [fillInput, setFillInput] = useState<string>('');
  const [matchingState, setMatchingState] = useState<Record<string, string>>({});
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);

  // Evaluation states
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean>(false);

  // Score & History tracking
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [finalRecord, setFinalRecord] = useState<QuizAttemptRecord | null>(null);

  // Initialize or filter questions
  useEffect(() => {
    let filtered = lesson.questions;
    if (selectedDifficulty !== 'all') {
      filtered = lesson.questions.filter((q) => q.difficulty === selectedDifficulty);
    }
    if (filtered.length === 0) {
      filtered = lesson.questions;
    }
    setActiveQuestions(filtered);
    resetQuizState(filtered);
  }, [lesson, selectedDifficulty]);

  const resetQuizState = (questionsList: Question[]) => {
    setCurrentIndex(0);
    setSelectedOption('');
    setFillInput('');
    setMatchingState({});
    setSelectedLeftId(null);
    setIsAnswerChecked(false);
    setIsCurrentCorrect(false);
    setCorrectAnswersCount(0);
    setWrongQuestionIds([]);
    setStreak(0);
    setIsQuizCompleted(false);
    setFinalRecord(null);
  };

  const currentQ = activeQuestions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (isAnswerChecked) return;
    sound.playPop();
    setSelectedOption(option);
  };

  const handleSelectLeft = (leftId: string) => {
    if (isAnswerChecked) return;
    sound.playPop();
    setSelectedLeftId(leftId);
  };

  const handleSelectRight = (rightId: string) => {
    if (isAnswerChecked || !selectedLeftId) return;
    sound.playPop();
    setMatchingState((prev) => ({
      ...prev,
      [selectedLeftId]: rightId,
    }));
    setSelectedLeftId(null);
  };

  const handleCheckAnswer = () => {
    if (!currentQ || isAnswerChecked) return;

    let isCorrect = false;

    if (currentQ.type === 'multiple_choice') {
      if (!selectedOption) return;
      const cleanedSelected = selectedOption.trim().toLowerCase();
      const cleanedCorrect = currentQ.correctAnswer.trim().toLowerCase();
      isCorrect =
        cleanedSelected === cleanedCorrect ||
        cleanedSelected.startsWith(cleanedCorrect.slice(0, 2)) ||
        cleanedCorrect.includes(cleanedSelected);
    } else if (currentQ.type === 'fill_blank') {
      if (!fillInput.trim()) return;
      const userText = fillInput.trim().toLowerCase();
      const acceptedAnswers = currentQ.correctAnswer
        .toLowerCase()
        .split(',')
        .map((a) => a.trim());
      isCorrect = acceptedAnswers.some(
        (ans) => userText.includes(ans) || ans.includes(userText)
      );
    } else if (currentQ.type === 'matching') {
      if (!currentQ.matchingPairs) return;
      const totalPairs = currentQ.matchingPairs.length;
      const assignedCount = Object.keys(matchingState).length;
      if (assignedCount < totalPairs) return;

      const correctPairsCount = currentQ.matchingPairs.filter(
        (p) => matchingState[p.id] === p.id
      ).length;
      isCorrect = correctPairsCount === totalPairs;
    }

    setIsCurrentCorrect(isCorrect);
    setIsAnswerChecked(true);

    if (isCorrect) {
      sound.playSuccess();
      setCorrectAnswersCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      sound.playIncorrect();
      setWrongQuestionIds((prev) => [...prev, currentQ.id]);
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    sound.playPop();
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption('');
      setFillInput('');
      setMatchingState({});
      setSelectedLeftId(null);
      setIsAnswerChecked(false);
      setIsCurrentCorrect(false);
    } else {
      const total = activeQuestions.length;
      const finalCorrect = correctAnswersCount + (isCurrentCorrect ? 0 : 0);
      const percentage = Math.round((finalCorrect / total) * 100);
      const score = Number(((finalCorrect / total) * 10).toFixed(1));

      let stars = 1;
      if (percentage >= 80) stars = 3;
      else if (percentage >= 50) stars = 2;

      const record: QuizAttemptRecord = {
        lessonId: lesson.id,
        studentClass: studentClass,
        studentName: studentName || undefined,
        score,
        correctCount: finalCorrect,
        totalQuestions: total,
        percentage,
        stars,
        timestamp: Date.now(),
        wrongQuestionIds,
      };

      setFinalRecord(record);
      setIsQuizCompleted(true);
      sound.playCelebration();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#f97316', '#3b82f6', '#fb923c', '#10b981'],
      });

      onFinishQuiz(record);
    }
  };

  const handleRetryAll = () => {
    sound.playPop();
    resetQuizState(activeQuestions);
  };

  const handleRetryWrong = () => {
    sound.playPop();
    if (wrongQuestionIds.length === 0) return;
    const missedQuestions = lesson.questions.filter((q) =>
      wrongQuestionIds.includes(q.id)
    );
    if (missedQuestions.length > 0) {
      setActiveQuestions(missedQuestions);
      resetQuizState(missedQuestions);
    }
  };

  const getDifficultyBadge = (d: Difficulty) => {
    switch (d) {
      case 'easy':
        return (
          <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl shadow-xs">
            Mức 1: Nhận biết (Dễ)
          </span>
        );
      case 'medium':
        return (
          <span className="text-xs font-black text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl shadow-xs">
            Mức 2: Thông hiểu
          </span>
        );
      case 'hard':
        return (
          <span className="text-xs font-black text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-xl shadow-xs">
            Mức 3: Vận dụng (Khó)
          </span>
        );
    }
  };

  // -------------------------------------------------------------
  // REQUIRE STUDENT CLASS BEFORE STARTING REVIEW
  // -------------------------------------------------------------
  if (!studentClass) {
    const quickClasses = ['6A', '6B', '6C', '6D', '6A1', '6A2'];

    const handleStartWithClass = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = tempClass.trim();
      if (!trimmed) {
        setClassError('Em vui lòng nhập hoặc chọn tên lớp của mình nhé!');
        return;
      }
      sound.playSuccess();
      localStorage.setItem('student_class_name', trimmed);
      if (tempName.trim()) {
        localStorage.setItem('student_name', tempName.trim());
      }
      onSetStudentClass?.(trimmed, tempName.trim() || undefined);
    };

    return (
      <div className="max-w-md mx-auto px-4 py-8 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-slate-200 border-b-8 border-b-slate-300 space-y-5 text-center">
          <div className="flex justify-center">
            <TeacherAvatar size="xl" showBadge={true} className="border-4 border-white shadow-lg" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GV: Trương Thị Huyền Linh</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Nhập tên lớp để vào ôn tập
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Môn Tin học 6 · Em vui lòng nhập tên lớp của mình để bắt đầu làm {activeQuestions.length || 20} câu ôn tập nhé!
            </p>
          </div>

          <form onSubmit={handleStartWithClass} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Chọn nhanh lớp học:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {quickClasses.map((cls) => (
                  <button
                    type="button"
                    key={cls}
                    onClick={() => {
                      sound.playPop();
                      setTempClass(cls);
                      setClassError('');
                    }}
                    className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer border-2 ${
                      tempClass === cls
                        ? 'bg-blue-600 text-white border-blue-700 border-b-4 border-b-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 border-b-4 border-b-slate-300 hover:bg-blue-50/50 hover:border-blue-200'
                    }`}
                  >
                    Lớp {cls}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Tên lớp của em <span className="text-rose-500">*</span></span>
                <span className="text-[11px] font-medium text-slate-400 lowercase">(bắt buộc)</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={tempClass}
                  onChange={(e) => {
                    setTempClass(e.target.value);
                    setClassError('');
                  }}
                  placeholder="Nhập tên lớp của em (ví dụ: 6A, 6B...)"
                  className="w-full pl-10 pr-4 py-3 text-sm font-black rounded-2xl border-2 border-slate-300 border-b-4 border-b-slate-400 focus:border-blue-600 focus:border-b-blue-800 outline-none transition-all uppercase"
                  autoFocus
                />
              </div>
              {classError && (
                <p className="text-xs font-bold text-rose-600 pl-1">{classError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Họ và tên của em</span>
                <span className="text-[11px] font-medium text-slate-400 lowercase">(không bắt buộc)</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full pl-10 pr-4 py-3 text-sm font-bold rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 focus:border-blue-600 focus:border-b-blue-800 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-3d-orange w-full py-3.5 rounded-2xl text-sm font-black shadow-lg cursor-pointer flex items-center justify-center gap-2 transform hover:scale-101"
              >
                <span>Vào làm bài ôn tập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!currentQ && !isQuizCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Chưa có câu hỏi nào</h3>
        <p className="text-sm text-slate-500">
          Bài học này hiện chưa có câu hỏi. Thầy/Cô Huyền Linh có thể thêm câu hỏi mới trong Chế độ Giáo viên.
        </p>
        <button
          onClick={onBackToKnowledge}
          className="btn-3d-blue px-5 py-2.5 text-xs font-black rounded-xl cursor-pointer"
        >
          Quay lại lý thuyết
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3D SUMMARY SCREEN WHEN QUIZ IS FINISHED
  // -------------------------------------------------------------
  if (isQuizCompleted && finalRecord) {
    const isMastered = finalRecord.percentage >= 80;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border-2 border-slate-200 border-b-8 border-b-slate-300 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          {/* 3D Golden Trophy */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-600 border-b-6 border-b-amber-700 text-white flex items-center justify-center mx-auto shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
            <Trophy className="w-10 h-10 drop-shadow-md text-amber-950" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              Chúc mừng em đã hoàn thành bài!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">
              {lesson.title}
            </h2>
            {finalRecord.studentClass && (
              <div className="pt-1 flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black border border-blue-200 shadow-xs">
                  <span>Học sinh {finalRecord.studentName ? `${finalRecord.studentName} · ` : ''}Lớp: {finalRecord.studentClass}</span>
                </span>
              </div>
            )}
            <p className="text-xs font-bold text-slate-500">
              Biên soạn & Giảng dạy: <span className="text-orange-600 font-black">GV Trương Thị Huyền Linh</span>
            </p>
          </div>

          {/* 3D Star Rating */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`p-2 rounded-2xl transition-all transform ${
                  starIdx <= finalRecord.stars
                    ? 'bg-amber-100 border-2 border-amber-300 border-b-4 border-b-amber-500 scale-110'
                    : 'bg-slate-100 border border-slate-200 opacity-40'
                }`}
              >
                <Star
                  className={`w-8 h-8 ${
                    starIdx <= finalRecord.stars
                      ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                      : 'text-slate-300'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* 3D Score & Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="bg-blue-50 border-2 border-blue-200 border-b-4 border-b-blue-300 rounded-2xl p-3.5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-blue-700 tabular-nums">
                {finalRecord.score}
              </div>
              <div className="text-[11px] font-black text-blue-900 uppercase mt-0.5">
                Điểm số (/10)
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 border-b-4 border-b-emerald-300 rounded-2xl p-3.5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
                {finalRecord.correctCount}/{finalRecord.totalQuestions}
              </div>
              <div className="text-[11px] font-black text-emerald-900 uppercase mt-0.5">
                Câu đúng
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 border-b-4 border-b-orange-300 rounded-2xl p-3.5 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-orange-600 tabular-nums">
                {finalRecord.percentage}%
              </div>
              <div className="text-[11px] font-black text-orange-900 uppercase mt-0.5">
                Chính xác
              </div>
            </div>
          </div>

          {/* Encouragement Badge from Teacher with Avatar */}
          <div
            className={`p-4 rounded-3xl text-xs sm:text-sm font-semibold border-2 flex items-center gap-4 text-left ${
              isMastered
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950 border-emerald-300 border-b-4 border-b-emerald-400'
                : 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-950 border-orange-300 border-b-4 border-b-orange-400'
            }`}
          >
            <TeacherAvatar size="lg" showBadge={false} className="shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-black text-sm text-orange-700">
                <Award className="w-4 h-4 text-orange-600" />
                <span>
                  {finalRecord.percentage === 100
                    ? 'Nhà Thông Thái Xuất Sắc 🏆'
                    : finalRecord.percentage >= 80
                    ? 'Chiến Binh Tri Thức Tài Ba 🌟'
                    : 'Người Học Chăm Chỉ 🚀'}
                </span>
              </div>
              <p className="leading-relaxed">
                {isMastered
                  ? 'Cô Huyền Linh chúc mừng em! Em đã nắm rất vững kiến thức bài học và đạt kết quả tuyệt vời.'
                  : 'Cô Huyền Linh khen ngợi tinh thần học hỏi của em! Hãy luyện lại các câu chưa đúng để đạt điểm 10 trọn vẹn nhé.'}
              </p>
            </div>
          </div>

          {/* 3D Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRetryAll}
              className="btn-3d-blue w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại toàn bộ</span>
            </button>

            {wrongQuestionIds.length > 0 && (
              <button
                onClick={handleRetryWrong}
                className="btn-3d-orange w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black cursor-pointer shadow-md"
              >
                <span>Làm lại {wrongQuestionIds.length} câu đã sai</span>
              </button>
            )}

            <button
              onClick={onBackToKnowledge}
              className="btn-3d-white w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black cursor-pointer text-slate-700"
            >
              <BookOpen className="w-4 h-4" />
              <span>Xem lại lý thuyết</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE QUESTION SCREEN (3D Tactile Interactive Quiz)
  // -------------------------------------------------------------
  const progressPercent = Math.round(
    ((currentIndex + 1) / activeQuestions.length) * 100
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Quiz Top Control Bar with 3D Depth */}
      <div className="bg-white border-2 border-slate-200 border-b-6 border-b-slate-300 rounded-3xl p-4 sm:p-5 shadow-md space-y-3.5">
        {/* Row 1: Difficulty Filters & Streak */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-black text-slate-600 mr-1">Mức độ ôn tập:</span>
            {(['all', 'medium', 'hard', 'easy'] as const).map((diff) => {
              const count =
                diff === 'all'
                  ? lesson.questions.length
                  : lesson.questions.filter((q) => q.difficulty === diff).length;
              if (count === 0 && diff === 'easy') return null;
              return (
                <button
                  key={diff}
                  onClick={() => {
                    sound.playPop();
                    setSelectedDifficulty(diff);
                  }}
                  className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    selectedDifficulty === diff
                      ? diff === 'medium'
                        ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-xs'
                        : diff === 'hard'
                        ? 'bg-rose-600 text-white border-2 border-rose-700 shadow-xs'
                        : 'btn-3d-blue shadow-xs'
                      : 'btn-3d-white text-slate-700'
                  }`}
                >
                  {diff === 'all'
                    ? `Tất cả (${count})`
                    : diff === 'medium'
                    ? `Trung bình (${count})`
                    : diff === 'hard'
                    ? `Mức Khó (${count})`
                    : `Dễ (${count})`}
                </button>
              );
            })}
          </div>

          {streak >= 2 && (
            <div className="flex items-center gap-1.5 text-xs font-black text-orange-700 bg-orange-100 border-2 border-orange-300 border-b-4 border-b-orange-400 px-3 py-1 rounded-xl animate-bounce">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
              <span>Streak: {streak} câu đúng liên tiếp!</span>
            </div>
          )}
        </div>

        {/* Row 2: 3D Glossy Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-blue-900">
                Câu {currentIndex + 1} / {activeQuestions.length}
              </span>
              <span>·</span>
              {getDifficultyBadge(currentQ.difficulty)}
              {studentClass && (
                <>
                  <span>·</span>
                  <button
                    onClick={onOpenClassModal}
                    title="Nhấp để đổi tên lớp"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 text-[11px] font-black border border-orange-300 transition-colors cursor-pointer"
                  >
                    <span>Lớp {studentClass}</span>
                    <span className="text-[10px] text-orange-600">✎</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-black tabular-nums bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              <span>Đúng: {correctAnswersCount}</span>
            </div>
          </div>

          {/* 3D Progress Track */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 3D Question Card */}
      <div className="bg-white border-2 border-slate-200 border-b-8 border-b-slate-300 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
        {/* Context / Scenario */}
        {currentQ.context && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 text-xs sm:text-sm text-blue-950 font-bold leading-relaxed shadow-xs">
            📌 {currentQ.context}
          </div>
        )}

        {/* Question Prompt */}
        <div className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
          {currentQ.prompt}
        </div>

        {/* --------------------------------------------- */}
        {/* QUESTION TYPE 1: MULTIPLE CHOICE (3D Option Cards) */}
        {/* --------------------------------------------- */}
        {currentQ.type === 'multiple_choice' && currentQ.options && (
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isThisCorrect =
                isAnswerChecked &&
                (option === currentQ.correctAnswer ||
                  option.startsWith(currentQ.correctAnswer.slice(0, 2)));

              let cardStyle =
                'border-slate-200 border-b-4 border-b-slate-300 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/30';

              if (isAnswerChecked) {
                if (isThisCorrect) {
                  cardStyle =
                    'border-emerald-500 border-b-5 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-md';
                } else if (isSelected && !isThisCorrect) {
                  cardStyle =
                    'border-rose-400 border-b-5 border-b-rose-700 bg-rose-50 text-rose-950 shadow-md';
                } else {
                  cardStyle = 'border-slate-200 opacity-50 text-slate-400 border-b-2';
                }
              } else if (isSelected) {
                cardStyle =
                  'border-blue-600 border-b-5 border-b-blue-800 bg-blue-50 text-blue-950 font-black shadow-md transform -translate-y-0.5';
              }

              // Extract letter prefix A, B, C, D
              const prefix = option.slice(0, 2);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswerChecked}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {prefix.replace('.', '')}
                    </span>
                    <span className="text-sm font-bold leading-relaxed">{option.slice(2).trim()}</span>
                  </div>

                  {isAnswerChecked && isThisCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerChecked && isSelected && !isThisCorrect && (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* --------------------------------------------- */}
        {/* QUESTION TYPE 2: FILL IN THE BLANK (3D Input) */}
        {/* --------------------------------------------- */}
        {currentQ.type === 'fill_blank' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-600">
              Nhập từ hoặc câu trả lời ngắn của em vào ô bên dưới:
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={fillInput}
                onChange={(e) => setFillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnswerChecked && fillInput.trim()) {
                    handleCheckAnswer();
                  }
                }}
                disabled={isAnswerChecked}
                placeholder="Nhập câu trả lời của em tại đây..."
                className={`flex-1 px-4 py-3 text-sm font-bold rounded-2xl border-2 transition-all outline-none ${
                  isAnswerChecked
                    ? isCurrentCorrect
                      ? 'border-emerald-500 border-b-4 border-b-emerald-700 bg-emerald-50 text-emerald-900'
                      : 'border-rose-500 border-b-4 border-b-rose-700 bg-rose-50 text-rose-900'
                    : 'border-slate-300 border-b-4 border-b-slate-400 focus:border-blue-600 focus:border-b-blue-800 bg-white'
                }`}
              />
              {!isAnswerChecked && (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!fillInput.trim()}
                  className="btn-3d-blue px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi</span>
                </button>
              )}
            </div>
            {isAnswerChecked && (
              <div className="text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Đáp án chuẩn: <span className="text-emerald-700 font-black">{currentQ.correctAnswer}</span>
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------- */}
        {/* QUESTION TYPE 3: MATCHING COLUMNS (3D Matching) */}
        {/* --------------------------------------------- */}
        {currentQ.type === 'matching' && currentQ.matchingPairs && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-600">
              Chạm hoặc nhấp vào một mục ở <strong className="text-blue-700">Cột A</strong>, sau đó chọn mục tương ứng ở <strong className="text-orange-700">Cột B</strong> để ghép đôi:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Column A (Left) */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Cột A (Khái niệm)</span>
                </div>
                {currentQ.matchingPairs.map((pair) => {
                  const isSelected = selectedLeftId === pair.id;
                  const targetMatched = matchingState[pair.id];

                  return (
                    <button
                      key={pair.id}
                      onClick={() => handleSelectLeft(pair.id)}
                      disabled={isAnswerChecked}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 border-b-4 border-b-blue-800 bg-blue-50 text-blue-950 font-black shadow-md'
                          : targetMatched
                          ? 'border-slate-300 border-b-4 border-b-slate-400 bg-slate-50 text-slate-900 font-bold'
                          : 'border-slate-200 border-b-4 border-b-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{pair.left}</span>
                        {targetMatched && (
                          <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-lg">
                            Đã ghép
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Column B (Right) */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-orange-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  <span>Cột B (Nội dung / Ví dụ)</span>
                </div>
                {currentQ.matchingPairs.map((pair) => {
                  const matchedLeftKey = Object.keys(matchingState).find(
                    (k) => matchingState[k] === pair.id
                  );

                  return (
                    <button
                      key={pair.id}
                      onClick={() => handleSelectRight(pair.id)}
                      disabled={isAnswerChecked}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedLeftId
                          ? 'border-orange-300 border-b-4 border-b-orange-400 bg-orange-50/50 hover:bg-orange-50 text-orange-950 font-bold'
                          : matchedLeftKey
                          ? 'border-orange-500 border-b-4 border-b-orange-700 bg-orange-50 text-orange-950 font-black shadow-md'
                          : 'border-slate-200 border-b-4 border-b-slate-300 bg-white text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{pair.right}</span>
                        {matchedLeftKey && (
                          <Check className="w-4 h-4 text-orange-700 shrink-0 font-bold" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isAnswerChecked && Object.keys(matchingState).length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    sound.playPop();
                    setMatchingState({});
                    setSelectedLeftId(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-orange-600 underline cursor-pointer"
                >
                  Xóa các cặp ghép để ghép lại
                </button>
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------- */}
        {/* 3D CHECK ANSWER BUTTON */}
        {/* --------------------------------------------- */}
        {!isAnswerChecked && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCheckAnswer}
              disabled={
                currentQ.type === 'multiple_choice'
                  ? !selectedOption
                  : currentQ.type === 'fill_blank'
                  ? !fillInput.trim()
                  : Object.keys(matchingState).length < (currentQ.matchingPairs?.length || 0)
              }
              className="btn-3d-orange flex items-center gap-2 px-7 py-3.5 text-sm font-black rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Kiểm tra đáp án</span>
            </button>
          </div>
        )}

        {/* --------------------------------------------- */}
        {/* 3D FEEDBACK & DETAILED EXPLANATION */}
        {/* --------------------------------------------- */}
        {isAnswerChecked && (
          <div className="space-y-4 pt-2">
            {/* 3D Result callout */}
            <div
              className={`p-5 rounded-3xl border-2 flex items-start gap-3.5 shadow-md ${
                isCurrentCorrect
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 border-b-6 border-b-emerald-600 text-emerald-950'
                  : 'bg-gradient-to-r from-rose-50 to-amber-50 border-rose-300 border-b-6 border-b-rose-500 text-rose-950'
              }`}
            >
              {isCurrentCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-black text-base sm:text-lg">
                  {isCurrentCorrect
                    ? 'Chính xác! Cô Huyền Linh khen ngợi em! 🎉'
                    : 'Chưa chính xác rồi! Đừng nản lòng nhé! 💡'}
                </div>
                <div className="text-xs sm:text-sm font-medium leading-relaxed">
                  {isCurrentCorrect
                    ? 'Em đã áp dụng rất đúng kiến thức bài học.'
                    : 'Hãy đọc kỹ phần giải thích chi tiết dưới đây để ghi nhớ sâu sắc hơn nhé.'}
                </div>
              </div>
            </div>

            {/* 3D Detailed pedagogical explanation */}
            <div className="bg-slate-50 border-2 border-slate-200 border-b-5 border-b-slate-300 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Lời giải & Kiến thức SGK bài học:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {currentQ.explanation}
              </p>
            </div>

            {/* Next Question CTA */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="btn-3d-blue flex items-center gap-2 px-7 py-3.5 text-sm font-black rounded-2xl shadow-lg cursor-pointer transform hover:scale-102"
              >
                <span>
                  {currentIndex + 1 < activeQuestions.length
                    ? 'Câu tiếp theo'
                    : 'Xem kết quả tổng kết 🏆'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
