import React, { useState, useEffect } from 'react';

interface TeacherAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  interactive?: boolean;
  onAvatarUpdated?: (dataUrl: string) => void;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  size = 'md',
  className = '',
  showBadge = true,
  interactive = false,
  onAvatarUpdated,
}) => {
  const [imgError, setImgError] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string>('/a11.png');

  useEffect(() => {
    // Check if custom avatar was saved in localStorage
    const saved = localStorage.getItem('teacher_custom_avatar_v1');
    if (saved) {
      setAvatarSrc(saved);
      setImgError(false);
    } else {
      setAvatarSrc('/a11.png');
      setImgError(false);
    }
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const badgeSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarSrc(dataUrl);
        setImgError(false);
        localStorage.setItem('teacher_custom_avatar_v1', dataUrl);
        if (onAvatarUpdated) {
          onAvatarUpdated(dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden border-2 border-orange-300 border-b-4 border-b-orange-500 shadow-md bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black select-none transition-transform hover:scale-105`}
        title="GV: Trương Thị Huyền Linh"
      >
        {!imgError ? (
          <img
            src={avatarSrc}
            alt="GV: Trương Thị Huyền Linh"
            className="w-full h-full object-cover object-top"
            onError={() => {
              // Try relative 'a11.png' before falling back
              if (avatarSrc === '/a11.png') {
                setAvatarSrc('a11.png');
              } else {
                setImgError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex flex-col items-center justify-center text-white">
            <span className="font-black drop-shadow-sm">HL</span>
          </div>
        )}
      </div>

      {showBadge && (
        <span
          className={`absolute -bottom-1 -right-1 ${badgeSizeClasses[size]} rounded-full bg-emerald-500 border-2 border-white shadow-xs`}
          title="Đang hoạt động"
        />
      )}

      {interactive && (
        <label
          className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-black/40 rounded-2xl flex items-center justify-center text-[10px] text-white font-bold transition-opacity"
          title="Nhấp để cập nhật ảnh của cô"
        >
          <span>Đổi ảnh</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
