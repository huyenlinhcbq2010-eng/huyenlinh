import React, { useState, useEffect } from 'react';
import { TeacherAvatar } from './TeacherAvatar';
import { sound } from '../utils/sound';
import { Sparkles, Users, ArrowRight, X, GraduationCap } from 'lucide-react';

interface ClassInputModalProps {
  isOpen: boolean;
  initialClass?: string;
  initialName?: string;
  onClose?: () => void;
  onConfirm: (studentClass: string, studentName?: string) => void;
  isRequired?: boolean;
}

export const ClassInputModal: React.FC<ClassInputModalProps> = ({
  isOpen,
  initialClass = '',
  initialName = '',
  onClose,
  onConfirm,
  isRequired = true,
}) => {
  const [studentClass, setStudentClass] = useState<string>(initialClass);
  const [studentName, setStudentName] = useState<string>(initialName);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStudentClass(initialClass || localStorage.getItem('student_class_name') || '');
      setStudentName(initialName || localStorage.getItem('student_name') || '');
      setError('');
    }
  }, [isOpen, initialClass, initialName]);

  if (!isOpen) return null;

  const quickClasses = ['6A', '6B', '6C', '6D', '6A1', '6A2'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedClass = studentClass.trim();
    if (!trimmedClass) {
      setError('Em vui lòng nhập hoặc chọn tên lớp của mình nhé!');
      return;
    }

    sound.playSuccess();
    // Save to localStorage
    localStorage.setItem('student_class_name', trimmedClass);
    if (studentName.trim()) {
      localStorage.setItem('student_name', studentName.trim());
    }

    onConfirm(trimmedClass, studentName.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-slate-200 border-b-8 border-b-slate-300 space-y-5 my-8 relative">
        {/* Close button if not strictly required */}
        {!isRequired && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header with Teacher Avatar */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TeacherAvatar size="xl" showBadge={true} className="border-4 border-white shadow-lg" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GV: Trương Thị Huyền Linh</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Nhập tên lớp để vào ôn tập
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Môn Tin học 6 · Em vui lòng nhập tên lớp của mình để bắt đầu làm bài và ghi nhận điểm số nhé!
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Choice Chips */}
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
                    setStudentClass(cls);
                    setError('');
                  }}
                  className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer border-2 ${
                    studentClass === cls
                      ? 'bg-blue-600 text-white border-blue-700 border-b-4 border-b-blue-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 border-b-4 border-b-slate-300 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}
                >
                  Lớp {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Class Name Input */}
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
                value={studentClass}
                onChange={(e) => {
                  setStudentClass(e.target.value);
                  setError('');
                }}
                placeholder="Nhập tên lớp của em (ví dụ: 6A, 6B...)"
                className="w-full pl-10 pr-4 py-3 text-sm font-black rounded-2xl border-2 border-slate-300 border-b-4 border-b-slate-400 focus:border-blue-600 focus:border-b-blue-800 outline-none transition-all uppercase"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs font-bold text-rose-600 pl-1">{error}</p>
            )}
          </div>

          {/* Student Name Input (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Họ và tên của em</span>
              <span className="text-[11px] font-medium text-slate-400 lowercase">(không bắt buộc)</span>
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full pl-10 pr-4 py-3 text-sm font-bold rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 focus:border-blue-600 focus:border-b-blue-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit 3D Button */}
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
};
