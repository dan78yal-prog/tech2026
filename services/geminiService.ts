
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStudentSummary = async (student: Student) => {
  const gradesText = student.grades
    .map(g => `${g.type}: ${g.score} (${g.date})`)
    .join(", ");

  const prompt = `
    بصفتك مساعداً تربوياً، قم بتحليل أداء الطالب التالي بناءً على درجاته واقترح نصائح للمعلم لتحسين مستواه.
    اسم الطالب: ${student.name}
    السجل: ${gradesText || "لا يوجد سجل درجات بعد"}
    
    يرجى تقديم رد قصير، مشجع، وباللغة العربية الفصحى.
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
            status: {
              type: Type.STRING,
              description: 'حالة الطالب العامة (ممتاز، جيد، يحتاج تطوير)',
            },
            summary: {
              type: Type.STRING,
              description: 'ملخص للأداء الدراسي',
            },
            advice: {
              type: Type.STRING,
              description: 'نصيحة تربوية محددة للمعلم',
            },
          },
          required: ["status", "summary", "advice"],
        },
      }
    });

    const text = response.text || "{}";
    // تنظيف النص من أي علامات متبقية للماركدوان لضمان عمل JSON.parse
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      status: "غير متوفر",
      summary: "تعذر الحصول على ملخص حالياً",
      advice: "يرجى المحاولة لاحقاً"
    };
  }
};
