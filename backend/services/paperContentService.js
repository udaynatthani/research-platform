const prisma = require("../config/prisma");
const pdf = require("pdf-parse");
const fs = require("fs");

/**
 * Paper Content Service
 * Handles extraction of text from PDF files and storage.
 */

const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return {
    fullText: data.text,
    pageCount: data.numpages,
    info: data.info,
    metadata: data.metadata,
    version: data.version
  };
};

const savePaperContent = async (paperId, fullText, method = "PDF_PARSE") => {
  return prisma.paperContent.upsert({
    where: { paperId },
    update: { 
      fullText,
      extractionMethod: method
    },
    create: {
      paperId,
      fullText,
      extractionMethod: method
    }
  });
};

const getPaperContent = async (paperId) => {
  return prisma.paperContent.findUnique({
    where: { paperId }
  });
};

module.exports = {
  extractTextFromPDF,
  savePaperContent,
  getPaperContent
};
