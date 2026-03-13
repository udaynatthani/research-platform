const axios = require("axios");

/**
 * AI Service
 * Bridge between Express backend and Python AI Engine.
 * Calls the FastAPI endpoints for research intelligence.
 */

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 120000, // Increased timeout for long paper summarization
});


const formatAiError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return error.message || fallback;
  
  const detail = data.detail;
  if (detail) {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(d => `${d.loc ? d.loc.join('.') : 'msg'}: ${d.msg}`).join(' | ');
    }
    return JSON.stringify(detail);
  }

  // If there's an 'error' field but no 'detail'
  if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);

  return JSON.stringify(data);
};

const summarizePaper = async (text) => {
  try {
    const response = await aiClient.post("/ai/summarize-paper", { text });
    return response.data;
  } catch (error) {
    console.error("AI Summarize Error:", error.response?.data || error.message);
    throw new Error(formatAiError(error, "AI Summarization failed"));
  }
};

const chatWithPaper = async (question, paperId = null) => {
  try {
    const response = await aiClient.post("/ai/chat-with-paper", {
      question,
      paper_id: paperId,
    });
    return response.data;
  } catch (error) {
    console.error("AI Chat Error:", error.response?.data || error.message);
    throw new Error(formatAiError(error, "AI Chat failed"));
  }
};

const indexPaper = async (paperId, text) => {
  try {
    const response = await aiClient.post("/ai/index-paper", {
      paper_id: paperId,
      text,
    });
    return response.data;
  } catch (error) {
    console.error("AI Indexing Error:", error.response?.data || error.message);
    throw new Error(formatAiError(error, "AI Indexing failed"));
  }
};

const extractInsights = async (text) => {
  try {
    const response = await aiClient.post("/ai/extract-insights", { text });
    return response.data;
  } catch (error) {
    console.error("AI Insight Error:", error.response?.data || error.message);
    throw new Error(formatAiError(error, "AI Insight extraction failed"));
  }
};

const checkPlagiarism = async (text) => {
  try {
    const response = await aiClient.post("/ai/check-plagiarism", { text });
    return response.data;
  } catch (error) {
    console.error("AI Plagiarism Error:", error.response?.data || error.message);
    throw new Error(formatAiError(error, "AI Plagiarism check failed"));
  }
};

const getRecommendations = async (text, topK = 5) => {
  try {
    const response = await aiClient.post("/ai/recommend-papers", {
      text,
      top_k: topK,
    });
    return response.data;
  } catch (error) {
    console.error("AI Recommendation Error:", error.response?.data || error.message);
    throw new Error(formatAiError(error, "AI Recommendation failed"));
  }
};

module.exports = {
  summarizePaper,
  chatWithPaper,
  indexPaper,
  extractInsights,
  checkPlagiarism,
  getRecommendations,
};
