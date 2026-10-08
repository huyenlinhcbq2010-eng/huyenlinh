import { Lesson, QuizAttemptRecord, UserStats } from '../types';
import { DEFAULT_LESSONS } from '../data/defaultLessons';

const LESSONS_KEY = 'on_tap_thong_minh_lessons_v6';
const STATS_KEY = 'on_tap_thong_minh_stats_v1';
const ATTEMPTS_KEY = 'on_tap_thong_minh_attempts_v1';

export function getStoredLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    if (!raw) {
      localStorage.setItem(LESSONS_KEY, JSON.stringify(DEFAULT_LESSONS));
      return DEFAULT_LESSONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter out non-computer-science subjects
      const allowed = parsed.filter(
        (l) => l.subjectId === 'tin-hoc' || l.subjectName.toLowerCase().includes('tin')
      );
      if (allowed.length === 0) {
        localStorage.setItem(LESSONS_KEY, JSON.stringify(DEFAULT_LESSONS));
        return DEFAULT_LESSONS;
      }

      // Merge with DEFAULT_LESSONS: ensure all default lessons exist and their question counts are up-to-date
      const merged: Lesson[] = allowed.map((storedLesson: Lesson) => {
        const defaultMatch = DEFAULT_LESSONS.find((d) => d.id === storedLesson.id);
        if (
          defaultMatch &&
          !storedLesson.isCustom &&
          storedLesson.questions.length < defaultMatch.questions.length
        ) {
          return { ...defaultMatch };
        }
        return storedLesson;
      });

      // Add any default lessons that aren't yet in storage (e.g. Bài 2, Bài 3)
      for (const defLesson of DEFAULT_LESSONS) {
        if (!merged.some((l) => l.id === defLesson.id)) {
          merged.push(defLesson);
        }
      }

      localStorage.setItem(LESSONS_KEY, JSON.stringify(merged));
      return merged;
    }
    return DEFAULT_LESSONS;
  } catch (err) {
    console.error('Error reading lessons from storage:', err);
    return DEFAULT_LESSONS;
  }
}

export function saveLessons(lessons: Lesson[]): void {
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  } catch (err) {
    console.error('Error saving lessons to storage:', err);
  }
}

export function resetDefaultLessons(): Lesson[] {
  localStorage.setItem(LESSONS_KEY, JSON.stringify(DEFAULT_LESSONS));
  return DEFAULT_LESSONS;
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const today = new Date().toISOString().slice(0, 10);
    if (!raw) {
      return {
        totalQuizzesTaken: 0,
        totalStars: 0,
        currentStreakDays: 1,
        lastActiveDate: today,
        lessonBestScores: {},
      };
    }
    const stats: UserStats = JSON.parse(raw);
    return stats;
  } catch {
    return {
      totalQuizzesTaken: 0,
      totalStars: 0,
      currentStreakDays: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      lessonBestScores: {},
    };
  }
}

export function recordQuizAttempt(attempt: QuizAttemptRecord): UserStats {
  const stats = getUserStats();
  const today = new Date().toISOString().slice(0, 10);

  // Update streak
  if (stats.lastActiveDate !== today) {
    const lastDate = new Date(stats.lastActiveDate);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      stats.currentStreakDays += 1;
    } else if (diffDays > 1) {
      stats.currentStreakDays = 1;
    }
    stats.lastActiveDate = today;
  }

  stats.totalQuizzesTaken += 1;
  stats.totalStars += attempt.stars;

  // Update best score
  const currentBest = stats.lessonBestScores[attempt.lessonId] ?? 0;
  if (attempt.score > currentBest) {
    stats.lessonBestScores[attempt.lessonId] = attempt.score;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));

    // Also store attempts history (last 50)
    const rawAttempts = localStorage.getItem(ATTEMPTS_KEY);
    const attempts: QuizAttemptRecord[] = rawAttempts ? JSON.parse(rawAttempts) : [];
    attempts.unshift(attempt);
    if (attempts.length > 50) attempts.length = 50;
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (e) {
    console.error('Failed to save quiz attempt', e);
  }

  return stats;
}

export function getQuizAttempts(): QuizAttemptRecord[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
