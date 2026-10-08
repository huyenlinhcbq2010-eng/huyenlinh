import React from 'react';
import { UserStats, QuizAttemptRecord, Lesson } from '../types';
import { TeacherAvatar } from './TeacherAvatar';
import {
  Trophy,
  Star,
  Flame,
  Award,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface StatsViewProps {
  userStats: UserStats;
  attempts: QuizAttemptRecord[];
  lessons: Lesson[];
  studentClass?: string;
  studentName?: string;
  onOpenClassModal?: () => void;
  onSelectLesson: (lessonId: string) => void;
  onClearHistory: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  userStats,
  attempts,
  lessons,
  studentClass,
  studentName,
  onOpenClassModal,
  onSelectLesson,
  onClearHistory,
}) => {
  const getLessonTitle = (lessonId: string) => {
    const l = lessons.find((item) => item.id === lessonId);
    return l ? l.title : lessonId;
  };

  const getLessonSubject = (lessonId: string) => {
    const l = lessons.find((item) => item.id === lessonId);
    return l ? `${l.subjectName} · Lớp ${l.grade}` : '';
  };

  const badges = [
    {
      id: 'first_quiz',
      name: 'Khởi đầu hứng khởi',
      desc: 'Hoàn thành bài ôn tập đầu tiên',
      icon: '🌱',
      unlocked: userStats.totalQuizzesTaken >= 1,
    },
    {
      id: 'perfect_10',
      name: 'Điểm 10 Vàng',
      desc: 'Đạt điểm tuyệt đối 10/10 ở ít nhất 1 bài học',
      icon: '🏆',
      unlocked: Object.values(userStats.lessonBestScores).some((s) => s >= 10),
    },
    {
      id: 'star_collector',
      name: 'Thợ săn Ngôi sao',
      desc: 'Tích lũy được từ 10 ngôi sao trở lên',
      icon: '⭐',
      unlocked: userStats.totalStars >= 10,
    },
    {
      id: 'streak_master',
      name: 'Chuyên cần học hỏi',
      desc: 'Duy trì chuỗi ngày ôn tập liên tiếp',
      icon: '🔥',
      unlocked: userStats.currentStreakDays >= 3,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title with Teacher Attribution */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3.5">
          <TeacherAvatar size="lg" showBadge={true} />
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Đồng hành cùng học sinh: GV Trương Thị Huyền Linh</span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Hồ sơ học tập & Bảng thành tích
              </h2>
              {studentClass ? (
                <button
                  onClick={onOpenClassModal}
                  title="Nhấp để đổi tên lớp"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-900 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  <span>Lớp: {studentClass}</span>
                  <span className="text-[10px] text-orange-600">✎</span>
                </button>
              ) : (
                <button
                  onClick={onOpenClassModal}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                >
                  + Nhập lớp
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Điểm số và huy hiệu được lưu tự động trên thiết bị của em
            </p>
          </div>
        </div>

        {attempts.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Em có chắc muốn đặt lại toàn bộ lịch sử ôn tập không?')) {
                sound.playPop();
                onClearHistory();
              }
            }}
            className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {/* 3D Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stars */}
        <div className="bg-white border-2 border-amber-200 border-b-6 border-b-amber-400 rounded-3xl p-5 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shrink-0 border border-amber-300 shadow-sm">
            <Star className="w-7 h-7 fill-amber-300 text-amber-900" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-800 uppercase tracking-wide">
              Tổng sao thưởng
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {userStats.totalStars} sao
            </div>
          </div>
        </div>

        {/* Quizzes Taken */}
        <div className="bg-white border-2 border-blue-200 border-b-6 border-b-blue-400 rounded-3xl p-5 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shrink-0 border border-blue-500 shadow-sm">
            <Trophy className="w-7 h-7 drop-shadow-xs" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-800 uppercase tracking-wide">
              Lượt ôn tập đã làm
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {userStats.totalQuizzesTaken} lần
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white border-2 border-orange-200 border-b-6 border-b-orange-400 rounded-3xl p-5 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shrink-0 border border-orange-400 shadow-sm">
            <Flame className="w-7 h-7 fill-amber-200 text-orange-950 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-black text-orange-800 uppercase tracking-wide">
              Chuỗi chuyên cần
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {userStats.currentStreakDays} ngày
            </div>
          </div>
        </div>
      </div>

      {/* 3D Gamification: Badges & Achievements */}
      <div className="bg-white border-2 border-slate-200 border-b-6 border-b-slate-300 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-black text-slate-900">
            Huy hiệu danh dự đã mở khóa
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border-2 transition-all text-center space-y-1.5 ${
                b.unlocked
                  ? 'border-orange-300 border-b-5 border-b-orange-400 bg-gradient-to-b from-orange-50/60 to-amber-50/60 text-slate-900 shadow-xs'
                  : 'border-slate-200 border-b-4 border-b-slate-300 bg-slate-50/50 opacity-40 text-slate-400'
              }`}
            >
              <div className="text-3xl py-1">{b.icon}</div>
              <div className="font-black text-sm">{b.name}</div>
              <div className="text-[11px] leading-tight text-slate-500 font-medium">
                {b.desc}
              </div>
              <div className="pt-1.5">
                {b.unlocked ? (
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    ĐÃ MỞ KHÓA
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">Chưa mở</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Scores by Lesson */}
      <div className="bg-white border-2 border-slate-200 border-b-6 border-b-slate-300 rounded-3xl p-6 shadow-md space-y-4">
        <h3 className="text-lg font-black text-slate-900">
          Điểm số cao nhất theo từng bài học
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lessons.map((lesson) => {
            const best = userStats.lessonBestScores[lesson.id];
            const hasPlayed = best !== undefined;

            return (
              <div
                key={lesson.id}
                onClick={() => {
                  sound.playPop();
                  onSelectLesson(lesson.id);
                }}
                className="p-4 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 hover:border-blue-400 hover:border-b-blue-600 bg-white transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-blue-600">
                    {lesson.subjectName} · Lớp {lesson.grade}
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {lesson.title}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {hasPlayed ? (
                    <div className="space-y-0.5">
                      <div className="text-base font-black text-blue-700 tabular-nums">
                        {best}/10 đ
                      </div>
                      <div className="text-[11px] text-emerald-600 font-black flex items-center gap-0.5 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã ôn</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 italic">Chưa làm</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attempts History */}
      <div className="bg-white border-2 border-slate-200 border-b-6 border-b-slate-300 rounded-3xl p-6 shadow-md space-y-4">
        <h3 className="text-lg font-black text-slate-900">
          Lịch sử làm bài gần đây
        </h3>

        {attempts.length === 0 ? (
          <div className="text-center py-8 text-xs font-medium text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto opacity-30" />
            <p>Em chưa làm bài ôn tập nào. Hãy chọn một bài và bắt đầu nhé!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-600 font-black">
                  <th className="p-3">Bài học</th>
                  <th className="p-3">Lớp</th>
                  <th className="p-3">Điểm</th>
                  <th className="p-3">Câu đúng</th>
                  <th className="p-3">Sao</th>
                  <th className="p-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.slice(0, 10).map((att, i) => (
                  <tr key={i} className="hover:bg-blue-50/30">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{getLessonTitle(att.lessonId)}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {getLessonSubject(att.lessonId)}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-700">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-xs font-black border border-blue-200">
                        {att.studentClass || studentClass || 'Lớp 6'}
                      </span>
                    </td>
                    <td className="p-3 font-black text-blue-600 tabular-nums text-sm">
                      {att.score}/10
                    </td>
                    <td className="p-3 text-slate-700 font-bold tabular-nums">
                      {att.correctCount}/{att.totalQuestions}
                    </td>
                    <td className="p-3 text-amber-500 font-black tabular-nums">
                      {'★'.repeat(att.stars)}
                    </td>
                    <td className="p-3 text-slate-400 text-xs">
                      {new Date(att.timestamp).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
