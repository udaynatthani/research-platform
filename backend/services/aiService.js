const axios = require("axios");

/**
 * AI Service
 * Bridge between Express backend and Python AI Engine.
 * Calls the FastAPI endpoints for research intelligence.
 */

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 60000, // AI tasks can be slow
});

const summarizePaper = async (text) => {
  try {
    const response = await aiClient.post("/ai/summarize-paper", { text });
    return response.data;
  } catch (error) {
    console.error("AI Summarize Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "AI Summarization failed");
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
    throw new Error(error.response?.data?.detail || "AI Chat failed");
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
    throw new Error(error.response?.data?.detail || "AI Indexing failed");
  }
};

const extractInsights = async (text) => {
  try {
    const response = await aiClient.post("/ai/extract-insights", { text });
    return response.data;
  } catch (error) {
    console.error("AI Insight Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "AI Insight extraction failed");
  }
};

const checkPlagiarism = async (text) => {
  try {
    const response = await aiClient.post("/ai/check-plagiarism", { text });
    return response.data;
  } catch (error) {
    console.error("AI Plagiarism Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "AI Plagiarism check failed");
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
    throw new Error(error.response?.data?.detail || "AI Recommendation failed");
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
