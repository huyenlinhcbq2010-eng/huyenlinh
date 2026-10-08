import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Handler for Teacher Avatar image
app.get('/a11.png', (_req, res) => {
  const pngPath = path.join(process.cwd(), 'public', 'a11.png');
  const svgPath = path.join(process.cwd(), 'public', 'a11.svg');
  if (fs.existsSync(pngPath)) {
    res.sendFile(pngPath);
  } else if (fs.existsSync(svgPath)) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(svgPath);
  } else {
    res.status(404).send('Not found');
  }
});

// API endpoint for AI generating review questions for teachers
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic, grade, subject, difficulty, count = 3 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured. Utilizing built-in pedagogical template engine.',
        questions: []
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Bạn là chuyên gia sư phạm và thiết kế học liệu số Việt Nam.
Hãy tạo ${count} câu hỏi ôn tập chất lượng cao cho học sinh lớp ${grade || 6}, môn ${subject || 'Tin học'}, chủ đề/bài học: "${topic || 'Thông tin và Dữ liệu'}".
Độ khó yêu cầu: ${difficulty || 'đa dạng từ Dễ đến Vận dụng'}.

Mỗi câu hỏi cần đúng chuẩn chương trình giáo dục phổ thông Việt Nam, hấp dẫn, thân thiện với học sinh ("học mà chơi").
Trả về kết quả ĐÚNG ĐỊNH DẠNG JSON sau (không kèm markdown ngoài khối json):
[
  {
    "id": "ai_q_1",
    "type": "multiple_choice",
    "difficulty": "easy",
    "prompt": "Nội dung câu hỏi...",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correctAnswer": "Đáp án A",
    "explanation": "Lời giải thích rõ ràng, chi tiết vì sao đáp án này đúng dựa trên kiến thức bài học."
  }
]
Độ khó ("difficulty") có thể là: "easy" (Nhận biết - Dễ), "medium" (Thông hiểu - Trung bình), hoặc "hard" (Vận dụng - Khó).
Loại câu hỏi ("type") có thể là "multiple_choice" hoặc "fill_blank". Nếu là fill_blank thì không cần options.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '[]';
    try {
      const parsed = JSON.parse(text);
      return res.json({ success: true, questions: parsed });
    } catch {
      return res.json({ success: true, raw: text, questions: [] });
    }
  } catch (err: any) {
    console.error('AI generation error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi khi tạo câu hỏi tự động' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
