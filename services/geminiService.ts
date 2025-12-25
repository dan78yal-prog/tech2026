
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

// التأكد من عدم انهيار التطبيق إذا لم يكن مفتاح API متاحاً
const getSafeApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getSafeApiKey() });

export const getStudentSummary = async (student: Student) => {
  const apiKey = getSafeApiKey();
  if (!apiKey) {
    return {
      status: "غير مفعل",
      summary: "خدمة الذكاء الاصطناعي تحتاج لمفتاح API",
      advice: "يرجى ضبط الإعدادات"
    };
  }

  const gradesText = student.grades
    .map(g => `${g.type}: ${g.score} (${g.date})`)
    .join(", ");

  const prompt = `
    بصفتك مساعداً تربوياً، قم بتحليل أداء الطالب التالي بناءً على درجاته واقترح نصائح للمعلم لتحسين مستواه.
    اسم الطالب: ${student.name}
    السجل: ${gradesText || "لا يوجد سجل درجات بعد"}
    يرجى تقديم رد قصير، مشجع، وباللغة العربية الفصحى بصيغة JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            summary: { type: Type.STRING },
            advice: { type: Type.STRING },
          },
          required: ["status", "summary", "advice"],
        },
      }
    });

    const text = response.text || "{}";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      status: "خطأ",
      summary: "تعذر الاتصال بالذكاء الاصطناعي",
      advice: "تأكد من صلاحية مفتاح الـ API"
    };
  }
};
