const prisma = require("../config/prisma");
const axios = require("axios");

/**
 * Paper Service
 * Handles paper metadata, search (local and external), and persistence.
 */

const createPaper = async (data) => {
  return prisma.paper.create({
    data,
    include: {
      authors: {
        include: { author: true }
      }
    }
  });
};

const getPapers = async () => {
  return prisma.paper.findMany({
    include: {
      authors: {
        include: { author: true }
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
    console.error("External search error:", error.message);
    throw new Error("Failed to fetch papers from external API");
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

    return tx.paper.findUnique({
      where: { id: paper.id },
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" }
        }
      }
    });
  });

  return result;
};

module.exports = {
  createPaper,
  getPapers,
  getPaperById,
  searchPapers,
  searchExternalPapers,
  savePaperFromExternal
};