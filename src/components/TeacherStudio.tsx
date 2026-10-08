import React, { useState } from 'react';
import { Lesson, Question, Difficulty, QuestionType, KeyConcept } from '../types';
import { sound } from '../utils/sound';
import { TeacherAvatar } from './TeacherAvatar';
import {
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Save,
  X,
  Check,
  Award,
  FileText,
  Layers,
} from 'lucide-react';

interface TeacherStudioProps {
  currentLesson: Lesson;
  onUpdateLesson: (updated: Lesson) => void;
  onCreateLesson: (newLesson: Lesson) => void;
  onResetDefaults: () => void;
  onOpenAiGenerator: () => void;
  onCloseTeacherMode: () => void;
}

export const TeacherStudio: React.FC<TeacherStudioProps> = ({
  currentLesson,
  onUpdateLesson,
  onCreateLesson,
  onResetDefaults,
  onOpenAiGenerator,
  onCloseTeacherMode,
}) => {
  // Modal states
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);

  const [isEditLessonMetaOpen, setIsEditLessonMetaOpen] = useState<boolean>(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState<boolean>(false);
  const [isDocImportModalOpen, setIsDocImportModalOpen] = useState<boolean>(false);
  const [docRawText, setDocRawText] = useState<string>('');

  // Question Form State
  const [qType, setQType] = useState<QuestionType>('multiple_choice');
  const [qDifficulty, setQDifficulty] = useState<Difficulty>('medium');
  const [qPrompt, setQPrompt] = useState<string>('');
  const [qContext, setQContext] = useState<string>('');
  const [qOptions, setQOptions] = useState<string[]>([
    'A. ',
    'B. ',
    'C. ',
    'D. ',
  ]);
  const [qCorrectAnswer, setQCorrectAnswer] = useState<string>('');
  const [qExplanation, setQExplanation] = useState<string>('');

  // Lesson Meta Form State
  const [metaChapter, setMetaChapter] = useState<string>(
    currentLesson.chapter || 'Chủ đề 1: Máy tính và cộng đồng'
  );
  const [metaTitle, setMetaTitle] = useState<string>(currentLesson.title);
  const [metaSubtitle, setMetaSubtitle] = useState<string>(currentLesson.subtitle);
  const [metaObjectives, setMetaObjectives] = useState<string>(
    currentLesson.objectives.join('\n')
  );

  // Create Lesson Form State
  const [newGrade, setNewGrade] = useState<number>(6);
  const [newChapter, setNewChapter] = useState<string>(
    currentLesson.chapter || 'Chủ đề 1: Máy tính và cộng đồng'
  );
  const [newSubjectId, setNewSubjectId] = useState<string>('tin-hoc');
  const [newSubjectName, setNewSubjectName] = useState<string>('Tin học');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubtitle, setNewSubtitle] = useState<string>('');

  const handleOpenAddQuestion = () => {
    sound.playPop();
    setEditingQuestion(null);
    setQType('multiple_choice');
    setQDifficulty('medium');
    setQPrompt('');
    setQContext('');
    setQOptions(['A. ', 'B. ', 'C. ', 'D. ']);
    setQCorrectAnswer('A. ');
    setQExplanation('');
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    sound.playPop();
    setEditingQuestion(q);
    setQType(q.type);
    setQDifficulty(q.difficulty);
    setQPrompt(q.prompt);
    setQContext(q.context || '');
    setQOptions(q.options ? [...q.options] : ['A. ', 'B. ', 'C. ', 'D. ']);
    setQCorrectAnswer(q.correctAnswer);
    setQExplanation(q.explanation);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();

    const newQuestion: Question = {
      id: editingQuestion ? editingQuestion.id : `q_custom_${Date.now()}`,
      type: qType,
      difficulty: qDifficulty,
      prompt: qPrompt.trim(),
      context: qContext.trim() || undefined,
      options: qType === 'multiple_choice' ? qOptions.map((o) => o.trim()) : undefined,
      correctAnswer: qCorrectAnswer.trim(),
      explanation: qExplanation.trim(),
      matchingPairs:
        qType === 'matching'
          ? editingQuestion?.matchingPairs || [
              { id: 'm1', left: 'Mục 1', right: 'Khái niệm 1' },
              { id: 'm2', left: 'Mục 2', right: 'Khái niệm 2' },
            ]
          : undefined,
    };

    let updatedQuestions: Question[];
    if (editingQuestion) {
      updatedQuestions = currentLesson.questions.map((q) =>
        q.id === editingQuestion.id ? newQuestion : q
      );
    } else {
      updatedQuestions = [...currentLesson.questions, newQuestion];
    }

    onUpdateLesson({
      ...currentLesson,
      questions: updatedQuestions,
      isCustom: true,
      updatedAt: Date.now(),
    });

    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (confirm('Cô có chắc chắn muốn xóa câu hỏi này khỏi bài học?')) {
      sound.playPop();
      const updatedQuestions = currentLesson.questions.filter((q) => q.id !== qId);
      onUpdateLesson({
        ...currentLesson,
        questions: updatedQuestions,
        isCustom: true,
        updatedAt: Date.now(),
      });
    }
  };

  const handleSaveLessonMeta = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();

    const objectivesList = metaObjectives
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onUpdateLesson({
      ...currentLesson,
      chapter: metaChapter.trim() || undefined,
      title: metaTitle.trim(),
      subtitle: metaSubtitle.trim(),
      objectives: objectivesList,
      isCustom: true,
      updatedAt: Date.now(),
    });

    setIsEditLessonMetaOpen(false);
  };

  const handleSaveNewLesson = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();

    if (!newTitle.trim()) return;

    const brandNewLesson: Lesson = {
      id: `lesson_custom_${Date.now()}`,
      grade: newGrade,
      chapter: newChapter.trim() || undefined,
      subjectId: newSubjectId,
      subjectName: newSubjectName,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || `Khối ${newGrade} - Môn ${newSubjectName}`,
      objectives: [
        'Nắm vững kiến thức trọng tâm của bài học.',
        'Vận dụng giải các bài tập ôn tập từ dễ đến khó.',
      ],
      keyConcepts: [
        {
          id: `kc_new_1`,
          title: '1. Khái niệm trọng tâm',
          level: 'medium',
          definition: 'Nội dung kiến thức cốt lõi cần nhớ của bài học...',
          examples: ['Ví dụ minh họa 1', 'Ví dụ minh họa 2'],
          note: 'Ghi nhớ quan trọng của Cô Huyền Linh',
          iconName: 'Brain',
        },
      ],
      questions: [],
      isCustom: true,
      updatedAt: Date.now(),
    };

    onCreateLesson(brandNewLesson);
    setIsCreateLessonOpen(false);
    setNewTitle('');
    setNewSubtitle('');
  };

  const handleParseDocument = () => {
    if (!docRawText.trim()) return;
    sound.playPop();

    const lines = docRawText.split('\n');
    let chapterName = newChapter || 'Chương 1: Tin học cơ bản';
    let lessonTitle = '';
    let subtitleText = 'Nội dung biên soạn từ tài liệu học tập';
    const objectives: string[] = [];
    const parsedQuestions: Question[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (/^(chương|chủ đề)/i.test(line) && (!chapterName || chapterName === 'Chủ đề 1: Máy tính và cộng đồng')) {
        chapterName = line.replace(/^#+\s*/, '');
      } else if (/^(bài\s+\d+|bài\s*:)/i.test(line) && !lessonTitle) {
        lessonTitle = line.replace(/^#+\s*/, '');
      }
    }

    if (!lessonTitle) {
      lessonTitle = `Bài học mới (${new Date().toLocaleDateString('vi-VN')})`;
    }

    const questionBlocks = docRawText.split(/\n(?=(?:Câu|Bài tập|Q)\s*\d+[:.])/i);
    let qIdx = 1;

    for (const block of questionBlocks) {
      const bTrim = block.trim();
      if (!/^(?:Câu|Bài tập|Q)\s*\d+[:.]/i.test(bTrim)) {
        if (bTrim.toLowerCase().includes('mục tiêu')) {
          const obs = bTrim.split('\n').filter((l) => l.startsWith('-') || l.startsWith('+') || l.startsWith('•'));
          obs.forEach((o) => objectives.push(o.replace(/^[-+•]\s*/, '').trim()));
        }
        continue;
      }

      const blockLines = bTrim.split('\n').map((l) => l.trim()).filter(Boolean);
      const firstLine = blockLines[0] || '';
      const prompt = firstLine.replace(/^(?:Câu|Bài tập|Q)\s*\d+[:.]\s*/i, '').trim();

      let diff: Difficulty = 'medium';
      if (
        bTrim.toLowerCase().includes('khó') ||
        bTrim.toLowerCase().includes('vận dụng cao') ||
        bTrim.toLowerCase().includes('nâng cao')
      ) {
        diff = 'hard';
      } else if (bTrim.toLowerCase().includes('dễ') || bTrim.toLowerCase().includes('nhận biết')) {
        diff = 'easy';
      }

      const options = blockLines.filter((l) => /^[A-D][.:)]\s+/i.test(l));
      let answer = '';
      let explanation = '';

      const ansLine = blockLines.find((l) => /^(?:đáp án|đáp án đúng|chọn)[:.]\s*/i.test(l));
      if (ansLine) {
        const rawAns = ansLine.replace(/^(?:đáp án|đáp án đúng|chọn)[:.]\s*/i, '').trim();
        const matchedOpt = options.find((o) => o.toLowerCase().startsWith(rawAns.toLowerCase().slice(0, 1)));
        answer = matchedOpt || rawAns;
      } else if (options.length > 0) {
        answer = options[0];
      }

      const expLine = blockLines.find((l) => /^(?:giải thích|lời giải|hướng dẫn)[:.]\s*/i.test(l));
      if (expLine) {
        explanation = expLine.replace(/^(?:giải thích|lời giải|hướng dẫn)[:.]\s*/i, '').trim();
      } else {
        explanation = 'Kiến thức chính xác theo tài liệu biên soạn của GV Trương Thị Huyền Linh.';
      }

      parsedQuestions.push({
        id: `q_doc_${Date.now()}_${qIdx++}`,
        type: 'multiple_choice',
        difficulty: diff,
        prompt: prompt || `Câu hỏi ôn tập ${qIdx}`,
        options: options.length >= 2 ? options : ['A. Lựa chọn 1', 'B. Lựa chọn 2', 'C. Lựa chọn 3', 'D. Lựa chọn 4'],
        correctAnswer: answer || 'A. Lựa chọn 1',
        explanation: explanation,
      });
    }

    if (objectives.length === 0) {
      objectives.push('Nắm vững toàn bộ kiến thức trong tài liệu học tập.');
      objectives.push('Vận dụng trả lời chính xác các câu hỏi từ trung bình đến khó.');
    }

    const createdLesson: Lesson = {
      id: `lesson_doc_${Date.now()}`,
      grade: newGrade,
      chapter: chapterName,
      subjectId: 'tin-hoc',
      subjectName: 'Tin học',
      title: lessonTitle,
      subtitle: subtitleText,
      objectives: objectives,
      keyConcepts: [
        {
          id: `kc_doc_1`,
          title: 'Kiến thức cốt lõi (Từ tài liệu)',
          level: 'medium',
          definition: 'Nội dung trọng tâm được trích xuất trực tiếp từ tài liệu do giáo viên cung cấp.',
          examples: ['Theo các ví dụ và dẫn chứng trong tài liệu học tập.'],
          note: 'Học sinh đọc kĩ nội dung để vận dụng giải câu hỏi.',
          iconName: 'Brain',
        },
        {
          id: `kc_doc_2`,
          title: 'Vận dụng chuyên sâu (Mức độ Khó)',
          level: 'hard',
          definition: 'Phần kiến thức nâng cao đòi hỏi học sinh phân tích, so sánh và liên hệ thực tiễn.',
          examples: ['Các bài tập tình huống và phân tích dữ liệu thực tế.'],
          note: 'Chú ý các điểm bẫy và quy tắc cần ghi nhớ.',
          iconName: 'Lightbulb',
        },
      ],
      questions: parsedQuestions.length > 0 ? parsedQuestions : currentLesson.questions,
      isCustom: true,
      updatedAt: Date.now(),
    };

    sound.playSuccess();
    onCreateLesson(createdLesson);
    setIsDocImportModalOpen(false);
    setDocRawText('');
    alert(
      `Đã nhập thành công bài học "${createdLesson.title}" thuộc "${createdLesson.chapter}" với ${createdLesson.questions.length} câu hỏi!`
    );
  };

  const handleExportJson = () => {
    sound.playPop();
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(currentLesson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${currentLesson.id}_on_tap_thong_minh.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.id && parsed.title && Array.isArray(parsed.questions)) {
          sound.playSuccess();
          onUpdateLesson({
            ...parsed,
            isCustom: true,
            updatedAt: Date.now(),
          });
          alert('Đã nhập bài học thành công!');
        } else {
          alert('File JSON không đúng cấu trúc bài học.');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const easyCount = currentLesson.questions.filter((q) => q.difficulty === 'easy').length;
  const mediumCount = currentLesson.questions.filter((q) => q.difficulty === 'medium').length;
  const hardCount = currentLesson.questions.filter((q) => q.difficulty === 'hard').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 3D Teacher Banner with Warm Orange & Blue */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white rounded-3xl p-6 sm:p-7 border-2 border-orange-600 border-b-6 border-b-orange-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <TeacherAvatar size="xl" interactive={true} className="border-4 border-white/60 shadow-lg" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-100">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Studio Biên soạn Học liệu số · GV: Trương Thị Huyền Linh</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-xs">
              {currentLesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-orange-50 font-medium">
              Cô Huyền Linh có thể cập nhật kiến thức bài học, thêm câu hỏi 3 mức độ (Dễ, Trung bình, Khó) hoặc tạo bài mới.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCloseTeacherMode}
            className="px-5 py-2.5 text-xs font-black bg-white text-orange-900 hover:bg-orange-50 border-2 border-white border-b-4 border-b-orange-200 rounded-2xl shadow-md transition-all cursor-pointer transform hover:scale-105 active:translate-y-1"
          >
            Quay lại góc học sinh
          </button>
        </div>
      </div>

      {/* 3D Action Toolbar */}
      <div className="bg-white border-2 border-slate-200 border-b-6 border-b-slate-300 rounded-3xl p-4 sm:p-5 shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Left Actions: 3D Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddQuestion}
            className="btn-3d-blue flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-2xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi mới</span>
          </button>

          <button
            onClick={onOpenAiGenerator}
            className="btn-3d-orange flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-2xl shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Trợ lý AI gợi ý câu hỏi</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setMetaTitle(currentLesson.title);
              setMetaSubtitle(currentLesson.subtitle);
              setMetaObjectives(currentLesson.objectives.join('\n'));
              setIsEditLessonMetaOpen(true);
            }}
            className="btn-3d-white flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-2xl cursor-pointer text-slate-700"
          >
            <Edit3 className="w-4 h-4" />
            <span>Sửa tóm tắt bài</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setIsCreateLessonOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:translate-y-1 flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-2xl cursor-pointer shadow-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>Tạo bài học mới</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setIsDocImportModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-900 active:translate-y-1 flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-2xl cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Dán / Nhập tài liệu</span>
          </button>
        </div>

        {/* Right Actions: Export / Import / Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            title="Tải về file bài học JSON để lưu trữ"
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            title="Nhập bài học từ file JSON"
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (
                confirm(
                  'Cô Huyền Linh có muốn khôi phục lại dữ liệu bài học gốc chuẩn SGK không?'
                )
              ) {
                onResetDefaults();
              }
            }}
            title="Khôi phục dữ liệu bài học mẫu SGK"
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục gốc</span>
          </button>
        </div>
      </div>

      {/* Question Statistics Bar with 3D Depth */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500">Tổng số câu hỏi</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {currentLesson.questions.length} câu
          </div>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-200 border-b-4 border-b-emerald-300 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-black text-emerald-800">Mức 1: Nhận biết (Dễ)</div>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">
            {easyCount} câu
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 border-b-4 border-b-amber-300 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-black text-amber-800">Mức 2: Thông hiểu</div>
          <div className="text-2xl font-black text-amber-700 tabular-nums">
            {mediumCount} câu
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-200 border-b-4 border-b-rose-300 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-black text-rose-800">Mức 3: Vận dụng (Khó)</div>
          <div className="text-2xl font-black text-rose-700 tabular-nums">
            {hardCount} câu
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span>Danh sách câu hỏi trong bài ({currentLesson.questions.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Học sinh được rèn luyện từ Dễ đến Vận dụng
          </span>
        </div>

        {currentLesson.questions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              Chưa có câu hỏi nào trong bài học này.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={handleOpenAddQuestion}
                className="btn-3d-blue px-4 py-2.5 text-xs font-black rounded-xl"
              >
                + Thêm câu hỏi
              </button>
              <button
                onClick={onOpenAiGenerator}
                className="btn-3d-orange px-4 py-2.5 text-xs font-black rounded-xl"
              >
                Gợi ý bằng AI
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {currentLesson.questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white border-2 border-slate-200 border-b-5 border-b-slate-300 rounded-3xl p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                        Câu {idx + 1}
                      </span>
                      <span>·</span>
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${
                          q.difficulty === 'easy'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : q.difficulty === 'medium'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {q.difficulty === 'easy'
                          ? 'Dễ (Nhận biết)'
                          : q.difficulty === 'medium'
                          ? 'Trung bình (Thông hiểu)'
                          : 'Vận dụng (Khó)'}
                      </span>
                      <span>·</span>
                      <span className="text-xs text-slate-500 font-bold">
                        {q.type === 'multiple_choice'
                          ? 'Trắc nghiệm 4 lựa chọn'
                          : q.type === 'fill_blank'
                          ? 'Điền từ khuyết'
                          : 'Nối cột A - B'}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-black text-slate-900 pt-1 leading-snug">
                      {q.prompt}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {q.type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border ${
                          opt === q.correctAnswer ||
                          opt.startsWith(q.correctAnswer.slice(0, 2))
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold'
                            : 'border-slate-200 bg-slate-50/70 font-medium'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-3.5 text-xs space-y-1 border border-slate-200">
                  <div className="text-slate-800">
                    <span className="font-black text-emerald-700">Đáp án đúng: </span>
                    <span className="font-bold">{q.correctAnswer}</span>
                  </div>
                  <div className="text-slate-600 leading-relaxed font-medium">
                    <span className="font-black text-slate-700">Giải thích của cô: </span>
                    {q.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT QUESTION */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới (GV: Huyền Linh)'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Dạng câu hỏi
                  </label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none font-bold"
                  >
                    <option value="multiple_choice">Trắc nghiệm 4 lựa chọn</option>
                    <option value="fill_blank">Điền từ / Trả lời ngắn</option>
                    <option value="matching">Ghép nối cột A và B</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Mức độ khó
                  </label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none font-bold"
                  >
                    <option value="easy">Mức 1: Nhận biết (Dễ)</option>
                    <option value="medium">Mức 2: Thông hiểu (Trung bình)</option>
                    <option value="hard">Mức 3: Vận dụng (Khó)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Tình huống thực tế / Ngữ cảnh (Không bắt buộc)
                </label>
                <input
                  type="text"
                  value={qContext}
                  onChange={(e) => setQContext(e.target.value)}
                  placeholder="Ví dụ: Quan sát Bảng 1.1 về lượng mưa hàng tháng..."
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Nội dung câu hỏi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none font-medium"
                />
              </div>

              {qType === 'multiple_choice' && (
                <div className="space-y-2">
                  <label className="block font-black text-slate-700">
                    Các phương án trả lời:
                  </label>
                  {qOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...qOptions];
                          newOpts[i] = e.target.value;
                          setQOptions(newOpts);
                        }}
                        className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setQCorrectAnswer(opt)}
                        className={`px-3 py-2 rounded-xl text-xs font-black cursor-pointer whitespace-nowrap ${
                          qCorrectAnswer === opt
                            ? 'bg-emerald-600 text-white border-b-2 border-emerald-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {qCorrectAnswer === opt ? '✓ Đáp án đúng' : 'Chọn đúng'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {qType === 'fill_blank' && (
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Đáp án đúng (Từ khóa chấp nhận, cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    required
                    value={qCorrectAnswer}
                    onChange={(e) => setQCorrectAnswer(e.target.value)}
                    placeholder="Ví dụ: hành động, hành vi"
                    className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Lời giải & Giải thích chi tiết cho học sinh <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Giải thích vì sao đáp án này đúng theo SGK..."
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl focus:border-blue-600 outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="btn-3d-white px-4 py-2 text-xs font-black rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-3d-blue px-6 py-2.5 text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu câu hỏi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT LESSON METADATA */}
      {isEditLessonMetaOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Chỉnh sửa bài học
              </h3>
              <button
                onClick={() => setIsEditLessonMetaOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLessonMeta} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Chương / Chủ đề <span className="text-orange-600">(Phân loại theo chương)</span>
                </label>
                <input
                  type="text"
                  value={metaChapter}
                  onChange={(e) => setMetaChapter(e.target.value)}
                  placeholder="Ví dụ: Chủ đề 1: Máy tính và cộng đồng"
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Tên bài học
                </label>
                <input
                  type="text"
                  required
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Mô tả phụ
                </label>
                <input
                  type="text"
                  value={metaSubtitle}
                  onChange={(e) => setMetaSubtitle(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Mục tiêu cần đạt ("Sau bài này em sẽ...", mỗi dòng 1 mục tiêu)
                </label>
                <textarea
                  rows={4}
                  value={metaObjectives}
                  onChange={(e) => setMetaObjectives(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditLessonMetaOpen(false)}
                  className="btn-3d-white px-4 py-2 text-xs font-black rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-3d-orange px-6 py-2.5 text-xs font-black rounded-xl shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW LESSON */}
      {isCreateLessonOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Tạo bài học ôn tập mới
              </h3>
              <button
                onClick={() => setIsCreateLessonOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewLesson} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-bold"
                  >
                    <option value={6}>Lớp 6 (Chương trình chuẩn)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Môn học
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => {
                      setNewSubjectId(e.target.value);
                      setNewSubjectName('Tin học');
                    }}
                    className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-bold"
                  >
                    <option value="tin-hoc">Tin học</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Chương / Chủ đề <span className="text-orange-600">(Phân loại theo chương)</span>
                </label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="Ví dụ: Chủ đề 1: Máy tính và cộng đồng"
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Tên bài học hoặc chủ đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 2: Mạng máy tính và Internet"
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Mô tả phụ
                </label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Ví dụ: SGK Tin học 6 - Kết nối tri thức"
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateLessonOpen(false)}
                  className="btn-3d-white px-4 py-2 text-xs font-black rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-3d-orange px-6 py-2.5 text-xs font-black rounded-xl shadow-xs cursor-pointer"
                >
                  Tạo bài học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: IMPORT DOCUMENT TEXT (CHƯƠNG & BÀI) */}
      {isDocImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border-2 border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Dán & Nhập tài liệu học tập theo Chương, Bài
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Hệ thống tự động đưa vào app theo chương, bài và phân loại mức độ Trung bình / Khó
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDocImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-amber-950 text-xs">
                <span className="font-black block mb-1">📌 Hướng dẫn nhập tài liệu:</span>
                Dán toàn bộ văn bản đề cương, SGK hoặc câu hỏi ôn tập vào khung dưới đây. Hệ thống chỉ lấy chính xác dữ liệu từ văn bản của bạn, không thêm dữ liệu ngoài.
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Chương / Chủ đề mặc định
                </label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="Ví dụ: Chủ đề 1: Máy tính và cộng đồng"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Nội dung tài liệu (Văn bản / Câu hỏi / Lý thuyết) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={10}
                  value={docRawText}
                  onChange={(e) => setDocRawText(e.target.value)}
                  placeholder="Dán toàn bộ nội dung tài liệu của bạn vào đây...&#10;&#10;Ví dụ:&#10;Chủ đề 1: Máy tính và cộng đồng&#10;Bài 2: Xử lý thông tin&#10;&#10;Câu 1 (Trung bình): Thiết bị nào sau đây là thiết bị vào?&#10;A. Bàn phím&#10;B. Màn hình&#10;C. Máy in&#10;D. Loa&#10;Đáp án: A. Bàn phím&#10;Giải thích: Bàn phím thu nhận dữ liệu gõ từ người dùng..."
                  className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl outline-none font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-100 flex-wrap gap-2">
                <span className="text-xs text-slate-500">
                  {docRawText.trim() ? `${docRawText.length} ký tự` : 'Chưa có nội dung'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDocImportModalOpen(false)}
                    className="btn-3d-white px-4 py-2 text-xs font-black rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={!docRawText.trim()}
                    onClick={handleParseDocument}
                    className="btn-3d-orange px-6 py-2.5 text-xs font-black rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    Bóc tách & Tạo bài ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
