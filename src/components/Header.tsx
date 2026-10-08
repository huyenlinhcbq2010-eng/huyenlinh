import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, UserCheck, Flame, Star } from 'lucide-react';
import { sound } from '../utils/sound';
import { UserStats } from '../types';
import { TeacherAvatar } from './TeacherAvatar';

interface HeaderProps {
  currentTab: 'knowledge' | 'quiz' | 'stats';
  onSelectTab: (tab: 'knowledge' | 'quiz' | 'stats') => void;
  isTeacherMode: boolean;
  onToggleTeacherMode: () => void;
  userStats: UserStats;
  studentClass?: string;
  onOpenClassModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isTeacherMode,
  onToggleTeacherMode,
  userStats,
  studentClass,
  onOpenClassModal,
}) => {
  const [muted, setMuted] = useState(sound.getMuted());

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sound.playPop();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark with Teacher Avatar as App Icon */}
        <div className="flex items-center gap-3 shrink-0">
          <TeacherAvatar size="md" className="cursor-pointer" />
          <div className="flex flex-col">
            <button
              onClick={() => onSelectTab('knowledge')}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <span className="text-xl font-black tracking-tight text-blue-950 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                ÔN TẬP THÔNG MINH
                <span className="text-orange-500 text-lg">★</span>
              </span>
            </button>
            {/* Teacher Attribution directly under Brand */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>GV: Trương Thị Huyền Linh</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links with 3D tactile feel */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => {
              sound.playPop();
              onSelectTab('knowledge');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'knowledge'
                ? 'bg-blue-600 text-white shadow-sm border-b-2 border-blue-800 transform -translate-y-0.5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Kiến thức cần nhớ
          </button>

          <button
            onClick={() => {
              sound.playPop();
              onSelectTab('quiz');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'quiz'
                ? 'bg-orange-500 text-white shadow-sm border-b-2 border-orange-700 transform -translate-y-0.5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Luyện tập câu hỏi
          </button>

          <button
            onClick={() => {
              sound.playPop();
              onSelectTab('stats');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'stats'
                ? 'bg-blue-600 text-white shadow-sm border-b-2 border-blue-800 transform -translate-y-0.5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Tiến độ & Kết quả
          </button>
        </nav>

        {/* Zone 3: Actions & Teacher Avatar Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Student Class Badge */}
          {studentClass ? (
            <button
              onClick={() => {
                sound.playPop();
                onOpenClassModal?.();
              }}
              title="Nhấp để đổi tên lớp của em"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border-2 border-blue-200 border-b-4 border-b-blue-400 rounded-2xl text-xs font-black text-blue-900 hover:bg-blue-100 transition-all cursor-pointer shadow-xs active:translate-y-1"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Lớp: {studentClass}</span>
              <span className="text-[10px] text-blue-600 font-bold ml-0.5">✎</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playPop();
                onOpenClassModal?.();
              }}
              className="btn-3d-blue flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black shadow-xs cursor-pointer"
            >
              <span>+ Nhập lớp</span>
            </button>
          )}

          {/* Teacher Badge Highlight with Avatar */}
          <div className="hidden lg:flex items-center gap-2 pl-1.5 pr-3 py-1 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl shadow-xs">
            <TeacherAvatar size="sm" showBadge={false} />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-500 leading-none">Chủ nhiệm nội dung</div>
              <div className="text-xs font-black text-orange-900 leading-tight">Cô Huyền Linh</div>
            </div>
          </div>

          {/* Gamified counters */}
          <div className="hidden sm:flex items-center gap-2.5 text-xs font-extrabold text-slate-700 bg-white border-2 border-slate-200 px-3 py-1.5 rounded-2xl shadow-xs">
            <span className="flex items-center gap-1 text-amber-600" title="Tổng số sao thưởng">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 drop-shadow-xs" />
              <span className="tabular-nums font-black">{userStats.totalStars}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-orange-600" title="Chuỗi ngày ôn tập liên tiếp">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-600 animate-bounce" />
              <span className="tabular-nums font-black">{userStats.currentStreakDays} ngày</span>
            </span>
          </div>

          {/* Sound Toggle (3D style) */}
          <button
            onClick={handleToggleSound}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="w-10 h-10 flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 border-b-4 border-b-slate-300 active:translate-y-1 active:border-b-2 transition-all cursor-pointer shadow-xs"
            aria-label="Toggle sound"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Teacher Mode Button (3D Orange button) */}
          <button
            onClick={() => {
              sound.playPop();
              onToggleTeacherMode();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-2xl transition-all cursor-pointer whitespace-nowrap shadow-sm ${
              isTeacherMode
                ? 'btn-3d-orange ring-2 ring-orange-300'
                : 'btn-3d-white hover:border-orange-300 text-slate-800'
            }`}
          >
            {isTeacherMode ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Chế độ GV Huyền Linh</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-orange-600" />
                <span className="hidden sm:inline">Soạn bài (GV: Huyền Linh)</span>
                <span className="sm:hidden">Soạn bài</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile sub-navigation bar */}
      <div className="flex md:hidden border-t-2 border-slate-100 px-4 py-2 bg-slate-50 gap-2 overflow-x-auto justify-around">
        <button
          onClick={() => {
            sound.playPop();
            onSelectTab('knowledge');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            currentTab === 'knowledge' ? 'bg-blue-600 text-white shadow-xs border-b-2 border-blue-800' : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          Kiến thức
        </button>
        <button
          onClick={() => {
            sound.playPop();
            onSelectTab('quiz');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            currentTab === 'quiz' ? 'bg-orange-500 text-white shadow-xs border-b-2 border-orange-700' : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          Ôn tập câu hỏi
        </button>
        <button
          onClick={() => {
            sound.playPop();
            onSelectTab('stats');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            currentTab === 'stats' ? 'bg-blue-600 text-white shadow-xs border-b-2 border-blue-800' : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          Tiến độ
        </button>
      </div>
    </header>
  );
};
