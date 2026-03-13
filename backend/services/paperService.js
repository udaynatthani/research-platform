const prisma = require("../config/prisma");
const axios = require("axios");
const aiService = require("./aiService");

/**
 * Paper Service
 * Handles paper metadata, search (local and external), and persistence.
 */

const createPaper = async (data) => {
  const { title, abstract, publicationYear, citationCount, doi, url, authors: authorsString } = data;

  return prisma.$transaction(async (tx) => {
    const paper = await tx.paper.create({
      data: {
        title,
        abstract,
        publicationYear,
        citationCount: citationCount || 0,
        doi,
        url
      }
    });

    if (authorsString) {
      // Split authors string by comma and trim
      const authorNames = authorsString.split(',').map(a => a.trim()).filter(a => a);

      for (let i = 0; i < authorNames.length; i++) {
        let author = await tx.author.findFirst({
          where: { name: authorNames[i] }
        });

        if (!author) {
          author = await tx.author.create({
            data: { name: authorNames[i] }
          });
        }

        await tx.paperAuthor.create({
          data: {
            paperId: paper.id,
            authorId: author.id,
            authorOrder: i + 1
          }
        });
      }
    }

    const paperWithAuthors = await tx.paper.findUnique({
      where: { id: paper.id },
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" }
        }
      }
    });

    // Auto-index if abstract is present
    if (abstract) {
      autoIndexPaper(paper.id, abstract).catch(err =>
        console.error(`Auto-indexing failed for paper ${paper.id}:`, err.message)
      );
    }

    return paperWithAuthors;
  });
};

/**
 * Helper to index paper in background
 */
const autoIndexPaper = async (paperId, text) => {
  try {
    // 1. Save to SQL paperContent
    await prisma.paperContent.upsert({
      where: { paperId },
      update: { fullText: text },
      create: {
        paperId,
        fullText: text,
        extractionMethod: "AUTO_INDEX",
      },
    });

    // 2. Index in Vector Store
    await aiService.indexPaper(paperId, text);
    console.log(`Successfully auto-indexed paper ${paperId}`);
  } catch (error) {
    throw error;
  }
};

const getPapers = async () => {
  return prisma.paper.findMany({
    include: {
      authors: {
        include: { author: true }
      },
      tags: {
        include: { tag: true }
      }
    }
  });
};

const getPaperById = async (id) => {
  return prisma.paper.findUnique({
    where: { id },
    include: {
      authors: {
        include: { author: true },
        orderBy: { authorOrder: "asc" }
      },
      tags: {
        include: { tag: true }
      },
      content: true,
      notes: true,
      insights: true
    }
  });
};

const searchPapers = async (query, filters = {}) => {
  const { field, year } = filters;

  const where = {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { abstract: { contains: query, mode: "insensitive" } }
    ]
  };

  if (field) {
    // Basic field filtering if we had a field column, currently papers don't have it
    // But we could search in tags if needed
  }

  if (year) {
    where.publicationYear = parseInt(year);
  }

  return prisma.paper.findMany({
    where,
    include: {
      authors: {
        include: { author: true }
      },
      tags: {
        include: { tag: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const searchExternalPapers = async (query) => {
  try {
    const response = await axios.get("https://api.semanticscholar.org/graph/v1/paper/search", {
      params: {
        query,
        limit: 10,
        fields: "title,authors,year,abstract,citationCount,doi,url"
      }
    });

    return response.data.data;
  } catch (error) {
    console.error("External search error:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      throw new Error("Please wait a moment and try again.");
    }

    const apiError = error.response?.data?.message || error.response?.data?.error;
    throw new Error(apiError ? `API Error: ${apiError}` : "Failed to fetch papers from external API. Please check your connection.");
  }
};

const savePaperFromExternal = async (externalData) => {
  const { title, abstract, year, citationCount, doi, url, authors } = externalData;

  // 1. Create or find authors and link them
  // This is a complex operation that needs to be atomic
  const result = await prisma.$transaction(async (tx) => {
    const paper = await tx.paper.create({
      data: {
        title,
        abstract,
        publicationYear: year || null,
        citationCount: citationCount || 0,
        doi,
        url
      }
    });

    if (authors && authors.length > 0) {
      for (let i = 0; i < authors.length; i++) {
        const authorData = authors[i];

        // Find or create author by name (imperfect but common for hackathons)
        let author = await tx.author.findFirst({
          where: { name: authorData.name }
        });

        if (!author) {
          author = await tx.author.create({
            data: { name: authorData.name }
          });
        }

        await tx.paperAuthor.create({
          data: {
            paperId: paper.id,
            authorId: author.id,
            authorOrder: i + 1
          }
        });
      }
    }

    const paperWithAuthors = await tx.paper.findUnique({
      where: { id: paper.id },
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" }
        }
      }
    });

    // Auto-index if abstract is present
    if (abstract) {
      autoIndexPaper(paper.id, abstract).catch(err =>
        console.error(`Auto-indexing failed for paper ${paper.id}:`, err.message)
      );
    }

    return paperWithAuthors;
  });

  return result;
};

const deletePaper = async (id) => {
  return prisma.$transaction(async (tx) => {
    // Delete related records that reference this paper
    await tx.paperAuthor.deleteMany({ where: { paperId: id } });
    await tx.paperTag.deleteMany({ where: { paperId: id } });
    await tx.paperNote.deleteMany({ where: { paperId: id } });
    await tx.collectionPaper.deleteMany({ where: { paperId: id } });
    await tx.insight.deleteMany({ where: { paperId: id } });
    await tx.paperContent.deleteMany({ where: { paperId: id } });
    
    // Get session IDs first to ensure reliable message deletion
    const sessions = await tx.aIChatSession.findMany({
      where: { paperId: id },
      select: { id: true }
    });
    const sessionIds = sessions.map(s => s.id);

    if (sessionIds.length > 0) {
      await tx.aIChatMessage.deleteMany({
        where: { sessionId: { in: sessionIds } }
      });
    }
    await tx.aIChatSession.deleteMany({ where: { paperId: id } });


    await tx.entityLink.deleteMany({
      where: {
        OR: [
          { sourceType: 'PAPER', sourceId: id },
          { targetType: 'PAPER', targetId: id }
        ]
      }
    });

    // Delete the paper itself
    return tx.paper.delete({ where: { id } });
  });
};

module.exports = {
  createPaper,
  getPapers,
  getPaperById,
  searchPapers,
  searchExternalPapers,
  savePaperFromExternal,
  deletePaper
};