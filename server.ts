import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize GenAI lazily to prevent crashing on boot if the key is missing
  const getGenAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Route for secure Chemistry chatbot assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = getGenAIClient();
      
      if (!ai) {
        return res.status(503).json({
          error: "مفتاح API الخاص بـ Gemini غير مهيأ حالياً. يرجى تهيئته في الإعدادات."
        });
      }

      // Convert client history format to Gemini API format
      const formattedContents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          formattedContents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      // Attempt generation with primary model and fallbacks if there are quota/spikes issues
      const modelsToTry = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.1-pro-preview",
        "gemini-flash-latest"
      ];

      let lastError = null;
      let responseText = "";

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting content generation with model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: `أنت الأستاذ في الكيمياء، مستشار وخبير مادة الكيمياء للثانوية العامة المصرية لعام 2026.
مهمتك هي الإجابة على أسئلة الطلاب في الكيمياء بأسلوب تعليمي مبسط، مشجع، ومبهج باللغة العربية الفصحى المطعمة ببعض الكلمات المصرية المألوفة (مثل: يا بطل، ركز معايا، تريكة الامتحان).
أنت تلتزم تماماً بمنهج وزارة التربية والتعليم المصرية لعام 2026 ونظام التقييم الحديث (الفهم ونواتج التعلم، استبعاد البدائل، التريكات والخدع الامتحانية الكامنة).
عند الإجابة:
1. بسّط المفهوم واشرحه بخطوات واضحة وسهلة الاستيعاب.
2. اذكر المعادلات الكيميائية الموزونة وظروف التفاعل بوضوح كامل إذا تطلب السؤال ذلك.
3. وجّه الطالب لربط أبواب المنهج ببعضها لتنمية فكر الربط والتحليل الفوري لديه.
4. استخدم استراتيجية "استبعاد البدائل الخاطئة" إذا سألك الطالب عن سؤال اختيار من متعدد.
5. كن ودوداً ومحفزاً جداً لتخفيف ضغط الثانوية العامة على الطالب بكلمات إيجابية مستمرة.`
            }
          });
          if (response && response.text) {
            responseText = response.text;
            break; // Success!
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed or unavailable:`, err.message || err);
          lastError = err;
        }
      }

      if (!responseText) {
        throw lastError || new Error("جميع خيارات النماذج الذكية غير متاحة حالياً بسبب ضغط الطلبات.");
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: error.message || "حدث خطأ في معالجة طلبك." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
