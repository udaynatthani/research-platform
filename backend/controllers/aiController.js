const prisma = require("../config/prisma");
const aiService = require("../services/aiService");
const paperService = require("../services/paperService");
const paperContentService = require("../services/paperContentService");
const insightService = require("../services/insightService");
const chatSessionService = require("../services/chatSessionService");

/**
 * AI Controller
 * Handles user requests for AI-powered features.
 */

const summarizePaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    
    // 1. Get paper content
    const content = await prisma.paperContent.findUnique({ where: { paperId } });
    if (!content) return res.status(404).json({ error: "Paper content not indexed yet" });

    // 2. Call AI engine
    const result = await aiService.summarizePaper(content.fullText);

    // 3. Optional: Store extracted topics/keywords as insights or tags
    // For now just return the result
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const chatWithPaper = async (req, res) => {
  try {
    const { paperId, sessionId, question } = req.body;
    const userId = req.user.userId;

    let activeSessionId = sessionId;

    // 1. Ensure content is indexed in AI vector store (check if first message in session)
    // In a real app, we might check a flag. For simplicity, we just chat.
    // Indexing usually happens when PDF is uploaded or paper is saved.

    // 2. Call AI Service
    const aiResponse = await aiService.chatWithPaper(question, paperId);

    // 3. Persist session and messages if needed
    if (!activeSessionId) {
      const session = await chatSessionService.createSession(userId, paperId);
      activeSessionId = session.id;
    }

    await chatSessionService.addMessage(activeSessionId, "user", question);
    await chatSessionService.addMessage(activeSessionId, "ai", aiResponse.answer);

    res.json({
      sessionId: activeSessionId,
      answer: aiResponse.answer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const extractInsights = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { projectId } = req.body;

    const content = await prisma.paperContent.findUnique({ where: { paperId } });
    if (!content) return res.status(404).json({ error: "Paper content not indexed yet" });

    const aiResult = await aiService.extractInsights(content.fullText);

    // Save as a formal Insight in the project
    const insight = await insightService.createInsight({
      projectId,
      paperId,
      content: aiResult.insights,
      createdBy: "AI",
    });

    res.json(insight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { paperId } = req.params;
    
    const content = await prisma.paperContent.findUnique({ where: { paperId } });
    if (!content) return res.status(404).json({ error: "Paper content not found" });

    const recommendations = await aiService.getRecommendations(content.fullText);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkPlagiarism = async (req, res) => {
  try {
    let { text, paperId } = req.body;
    
    // If text is missing but paperId is provided, fetch content
    if (!text && paperId) {
      const content = await prisma.paperContent.findUnique({ where: { paperId } });
      if (!content) return res.status(404).json({ error: "Paper content not indexed yet. Please run index first." });
      text = content.fullText;
    }

    if (!text) {
      return res.status(400).json({ error: "Either text or paperId is required" });
    }

    const result = await aiService.checkPlagiarism(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const indexPaper = async (req, res) => {
  try {
    const { paperId, text } = req.body;
    if (!paperId || !text) {
      return res.status(400).json({ error: "paperId and text are required" });
    }

    // 1. Ensure Paper exists in SQL DB
    const paper = await prisma.paper.findUnique({ where: { id: paperId } });
    if (!paper) {
      return res.status(404).json({ error: "Paper record not found. Please save the paper to the database first." });
    }

    // 2. Save/Update paper content in SQL for summarization/insights
    await prisma.paperContent.upsert({
      where: { paperId },
      update: { fullText: text },
      create: {
        paperId,
        fullText: text,
        extractionMethod: "MANUAL_INDEX",
      },
    });

    // 3. Index in AI Vector Store (FastAPI) for Chat/RAG
    const result = await aiService.indexPaper(paperId, text);
    
    res.json({
      message: "Paper indexed successfully in both SQL and Vector Store",
      aiResult: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  summarizePaper,
  chatWithPaper,
  extractInsights,
  getRecommendations,
  checkPlagiarism,
  indexPaper, // Added
};
