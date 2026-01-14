
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeFinances = async (transactions: any[], settings: any): Promise<string> => {
  // Always use direct initialization with apiKey from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const summary = transactions.slice(-20).map(t => `${t.date}: ${t.description} - R$${t.amount} (${t.type})`);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Atue como um consultor financeiro pessoal. Analise estes gastos recentes e dê dicas práticas para economizar.
      Contexto: O usuário deseja manter um limite de gastos de R$${settings.monthlyExpenseLimit}.
      Transações: ${JSON.stringify(summary)}
      Responda de forma concisa em Português do Brasil.`,
    });

    return response.text || "Continue registrando para obter análise.";
  } catch (error) {
    return "Erro ao analisar dados financeiros.";
  }
};

export const extractTransactionFromText = async (text: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia dados financeiros deste texto: "${text}". 
      Retorne JSON com: description, amount (number), type (income/expense), date (YYYY-MM-DD).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["description", "amount", "type", "date"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  } catch (e) {
    return null;
  }
};

/**
 * Organizes a list of subjects from a messy string of text using Gemini.
 */
export const organizeSubjectsFromText = async (text: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o seguinte texto e extraia uma lista de tópicos ou matérias de estudo.
      Retorne APENAS um array JSON de strings com os nomes dos tópicos.
      Texto: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * Generates subtopics for a specific subject based on the student's degree.
 */
export const generateSubtopicsForSubject = async (subject: string, degree: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma lista de subtópicos essenciais para estudar a matéria "${subject}" no contexto de um curso de "${degree}".
      Retorne APENAS um array JSON de strings com os nomes dos subtópicos (máximo 10).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * Provides an AI tutor response for a study chat session.
 */
export const getStudyChatResponse = async (subject: string, degree: string, message: string, history: any[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é um tutor especializado em ${degree}. Ajude o aluno a estudar ${subject}. 
      Responda de forma didática e encorajadora em Português do Brasil.
      Histórico anterior: ${JSON.stringify(history)}
      Dúvida atual: ${message}`,
    });
    
    return response.text || "Não consegui processar sua dúvida no momento.";
  } catch (e) {
    console.error(e);
    return "Erro ao processar conversa com a IA.";
  }
};

/**
 * Generates behavioral insights based on study streak and history.
 */
export const generateBehavioralInsights = async (stats: any, sessions: any[], degree: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const summary = {
      streak: stats.currentStreak,
      totalActiveDays: stats.totalActiveDays,
      recentSessions: sessions.slice(-10).map(s => ({ date: s.date, duration: s.duration, status: s.status }))
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o comportamento de estudo deste aluno de ${degree} com base nos dados abaixo e forneça 2 ou 3 insights comportamentais ou dicas de produtividade em Português do Brasil. Seja breve e encorajador.
      Dados: ${JSON.stringify(summary)}`,
    });

    return response.text || "";
  } catch (e) {
    console.error(e);
    return "";
  }
};
