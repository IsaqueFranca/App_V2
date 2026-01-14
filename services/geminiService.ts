
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
};

export const analyzeFinances = async (transactions: any[], goals: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "IA indisponível no momento.";

  try {
    const summary = transactions.slice(0, 30).map(t => `${t.date}: ${t.description} - R$${t.amount} (${t.type})`);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Atue como um consultor financeiro pessoal. Analise estes gastos recentes e dê 3 dicas práticas para economizar e atingir a meta: "${goals}".
      Transações: ${JSON.stringify(summary)}
      Responda em Português do Brasil de forma concisa e amigável.`,
    });

    return response.text || "Continue registrando para obter análise.";
  } catch (error) {
    return "Erro ao analisar dados.";
  }
};

export const extractTransactionFromText = async (text: string): Promise<any> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia os dados financeiros do seguinte texto: "${text}".
      Retorne JSON com: description, amount (number), type (income/expense), date (YYYY-MM-DD).
      Se não houver data, use a de hoje: ${new Date().toISOString().split('T')[0]}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING },
            date: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};

// Added for study planner: organize subjects from text input
export const organizeSubjectsFromText = async (text: string): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o seguinte texto de um edital ou lista de estudos e extraia APENAS os nomes das matérias ou assuntos principais: "${text}".
      Retorne o resultado estritamente como um array JSON de strings.`,
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
    console.error("Erro no organizeSubjectsFromText:", e);
    return [];
  }
};

// Added for study planner: generate subtopics for a given subject
export const generateSubtopicsForSubject = async (subject: string, degree: string): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Como um tutor especializado na área de ${degree}, liste os 5 subtópicos mais importantes e frequentes em provas para o assunto: "${subject}".
      Retorne o resultado estritamente como um array JSON de strings.`,
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
    console.error("Erro no generateSubtopicsForSubject:", e);
    return [];
  }
};

// Added for study planner: chat with AI tutor during study session
export const getStudyChatResponse = async (subject: string, degree: string, message: string, history: any[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Sistema de IA temporariamente indisponível.";

  try {
    const formattedHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.parts[0].text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: 'user', parts: [{ text: `Você é o QIsaque, um tutor inteligente para estudantes da área de ${degree}. Ajude o aluno a entender o assunto: ${subject}. Seja didático e incentive o estudo.` }] },
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ]
    });

    return response.text || "Desculpe, não consegui processar sua dúvida agora.";
  } catch (e) {
    console.error("Erro no getStudyChatResponse:", e);
    return "Ocorreu um erro ao consultar o tutor.";
  }
};

// Added for study planner: behavioral insights for statistics
export const generateBehavioralInsights = async (streakStats: any, sessions: any[], degree: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai || sessions.length === 0) return "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o desempenho deste estudante de ${degree}:
      Dias ativos: ${streakStats.totalActiveDays}.
      Sequência atual: ${streakStats.currentStreak} dias.
      Total de sessões: ${sessions.length}.
      Dê 2 dicas comportamentais curtas e motivadoras baseadas no ritmo. Responda em Português (Brasil).`,
    });

    return response.text || "";
  } catch (e) {
    return "";
  }
};
