/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lesson, QuizAttemptRecord, UserStats, Difficulty } from './types';
import { DEFAULT_SUBJECTS } from './data/defaultLessons';
import {
  getStoredLessons,
  saveLessons,
  resetDefaultLessons,
  getUserStats,
  recordQuizAttempt,
  getQuizAttempts,
} from './utils/storage';
import { Header } from './components/Header';
import { NavigationSelector } from './components/NavigationSelector';
import { KnowledgeView } from './components/KnowledgeView';
import { QuizView } from './components/QuizView';
import { StatsView } from './components/StatsView';
import { TeacherStudio } from './components/TeacherStudio';
import { AiQuestionModal } from './components/AiQuestionModal';
import { TeacherAvatar } from './components/TeacherAvatar';
import { ClassInputModal } from './components/ClassInputModal';
import { sound } from './utils/sound';

export default function App() {
  // Lessons state
  const [lessons, setLessons] = useState<Lesson[]>(() => getStoredLessons());
  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('tin-hoc');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('tin-hoc-6-bai-1');

  // Student class & name state
  const [studentClass, setStudentClass] = useState<string>(
    () => localStorage.getItem('student_class_name') || ''
  );
  const [studentName, setStudentName] = useState<string>(
    () => localStorage.getItem('student_name') || ''
  );
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'knowledge' | 'quiz' | 'stats'>('knowledge');
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // User Stats state
  const [userStats, setUserStats] = useState<UserStats>(() => getUserStats());
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>(() => getQuizAttempts());

  // Available grades (Focused exclusively on Grade 6)
  const grades = [6];

  // Current active lesson
  const currentLesson =
    lessons.find((l) => l.id === selectedLessonId) ||
    lessons.find((l) => l.grade === selectedGrade && l.subjectId === selectedSubjectId) ||
    lessons[0];

  // Whenever grade or subject changes, ensure valid selectedLessonId
  useEffect(() => {
    const matching = lessons.filter(
      (l) => l.grade === selectedGrade && l.subjectId === selectedSubjectId
    );
    if (matching.length > 0 && !matching.some((l) => l.id === selectedLessonId)) {
      setSelectedLessonId(matching[0].id);
    }
  }, [selectedGrade, selectedSubjectId, lessons, selectedLessonId]);

  // Handle Quiz Completed
  const handleFinishQuiz = (record: QuizAttemptRecord) => {
    const updatedStats = recordQuizAttempt(record);
    setUserStats({ ...updatedStats });
    setAttempts(getQuizAttempts());
  };

  // Teacher updates current lesson
  const handleUpdateLesson = (updated: Lesson) => {
    const newLessons = lessons.map((l) => (l.id === updated.id ? updated : l));
    setLessons(newLessons);
    saveLessons(newLessons);
  };

  // Teacher creates a new lesson
  const handleCreateLesson = (newLesson: Lesson) => {
    const newLessons = [newLesson, ...lessons];
    setLessons(newLessons);
    saveLessons(newLessons);
    setSelectedGrade(newLesson.grade);
    setSelectedSubjectId(newLesson.subjectId);
    setSelectedLessonId(newLesson.id);
  };

  // Teacher resets to default lessons
  const handleResetDefaults = () => {
    const def = resetDefaultLessons();
    setLessons(def);
    setSelectedGrade(6);
    setSelectedSubjectId('tin-hoc');
    setSelectedLessonId('tin-hoc-6-bai-1');
  };

  // AI adds generated questions
  const handleAddGeneratedQuestions = (newQuestions: any[]) => {
    if (!currentLesson) return;
    const updated: Lesson = {
      ...currentLesson,
      questions: [...currentLesson.questions, ...newQuestions],
      isCustom: true,
      updatedAt: Date.now(),
    };
    handleUpdateLesson(updated);
  };

  // Clear user attempt history
  const handleClearHistory = () => {
    localStorage.removeItem('on_tap_thong_minh_attempts_v1');
    localStorage.removeItem('on_tap_thong_minh_stats_v1');
    setUserStats(getUserStats());
    setAttempts([]);
  };

  const handleSelectTab = (tab: 'knowledge' | 'quiz' | 'stats') => {
    setIsTeacherMode(false);
    if (tab === 'quiz' && !studentClass) {
      sound.playPop();
      setIsClassModalOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');

  const handleStartReview = (targetDiff?: Difficulty | 'all') => {
    sound.playPop();
    if (targetDiff) {
      setSelectedDifficulty(targetDiff);
    }
    if (!studentClass) {
      setIsClassModalOpen(true);
    } else {
      setCurrentTab('quiz');
    }
  };

  const handleConfirmClass = (newClass: string, newName?: string) => {
    setStudentClass(newClass);
    if (newName) setStudentName(newName);
    setIsClassModalOpen(false);
    setCurrentTab('quiz');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Universal 3-Zone Top Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isTeacherMode={isTeacherMode}
        onToggleTeacherMode={() => {
          setIsTeacherMode(!isTeacherMode);
        }}
        userStats={userStats}
        studentClass={studentClass}
        onOpenClassModal={() => setIsClassModalOpen(true)}
      />

      {/* Grade, Subject & Lesson Selector Bar */}
      <NavigationSelector
        grades={grades}
        selectedGrade={selectedGrade}
        onSelectGrade={(g) => {
          setSelectedGrade(g);
        }}
        subjects={DEFAULT_SUBJECTS}
        selectedSubjectId={selectedSubjectId}
        onSelectSubject={(sId) => {
          setSelectedSubjectId(sId);
        }}
        lessons={lessons}
        selectedLessonId={currentLesson ? currentLesson.id : selectedLessonId}
        onSelectLesson={(lId) => {
          setSelectedLessonId(lId);
          // If in teacher mode, remain in teacher mode; else keep current tab
        }}
        userStats={userStats}
        studentClass={studentClass}
        onOpenClassModal={() => setIsClassModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isTeacherMode ? (
          <TeacherStudio
            currentLesson={currentLesson}
            onUpdateLesson={handleUpdateLesson}
            onCreateLesson={handleCreateLesson}
            onResetDefaults={handleResetDefaults}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
            onCloseTeacherMode={() => setIsTeacherMode(false)}
          />
        ) : (
          <>
            {currentTab === 'knowledge' && currentLesson && (
              <KnowledgeView
                lesson={currentLesson}
                onStartQuiz={handleStartReview}
                isTeacherMode={isTeacherMode}
                onOpenTeacherEdit={() => setIsTeacherMode(true)}
              />
            )}

            {currentTab === 'quiz' && currentLesson && (
              <QuizView
                lesson={currentLesson}
                initialDifficulty={selectedDifficulty}
                onFinishQuiz={handleFinishQuiz}
                onBackToKnowledge={() => {
                  sound.playPop();
                  setCurrentTab('knowledge');
                }}
                studentClass={studentClass}
                studentName={studentName}
                onOpenClassModal={() => setIsClassModalOpen(true)}
                onSetStudentClass={handleConfirmClass}
              />
            )}

            {currentTab === 'stats' && (
              <StatsView
                userStats={userStats}
                attempts={attempts}
                lessons={lessons}
                studentClass={studentClass}
                studentName={studentName}
                onOpenClassModal={() => setIsClassModalOpen(true)}
                onSelectLesson={(lId) => {
                  setSelectedLessonId(lId);
                  const target = lessons.find((item) => item.id === lId);
                  if (target) {
                    setSelectedGrade(target.grade);
                    setSelectedSubjectId(target.subjectId);
                  }
                  setCurrentTab('knowledge');
                }}
                onClearHistory={handleClearHistory}
              />
            )}
          </>
        )}
      </main>

      {/* Class Input Modal - Required before review */}
      <ClassInputModal
        isOpen={isClassModalOpen}
        initialClass={studentClass}
        initialName={studentName}
        onClose={() => setIsClassModalOpen(false)}
        onConfirm={handleConfirmClass}
        isRequired={!studentClass}
      />

      {/* AI Question Generation Modal for Teachers */}
      <AiQuestionModal
        currentLesson={currentLesson}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddGeneratedQuestions={handleAddGeneratedQuestions}
      />

      {/* 3D Footer with Teacher Attribution & Avatar */}
      <footer className="border-t-2 border-slate-200 bg-white py-5 text-center text-xs text-slate-600 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <TeacherAvatar size="sm" showBadge={false} />
            <span>
              <strong>ÔN TẬP THÔNG MINH</strong> · Biên soạn & Thiết kế học liệu số: <strong className="text-orange-600">GV Trương Thị Huyền Linh</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span>Chương trình GDPT mới (Lớp 6)</span>
            <span>·</span>
            <span>SGK Kết nối tri thức & Cánh diều</span>
            <span>·</span>
            <span className="text-blue-600 font-bold">Học mà chơi 🚀</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
