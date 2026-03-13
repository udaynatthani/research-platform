const prisma = require("../config/prisma");

/**
 * Collection Service
 * Handles user-defined collections of papers.
 */

const createCollection = async (userId, data) => {
  const { name, description } = data;
  return prisma.collection.create({
    data: {
      name,
      description,
      userId
    }
  });
};

const getCollections = async (userId) => {
  return prisma.collection.findMany({
    where: { userId },
    include: {
      _count: {
        select: { papers: true }
      }
    }
  });
};

const getCollectionById = async (id, userId) => {
  return prisma.collection.findFirst({
    where: { id, userId },
    include: {
      papers: {
        include: {
          paper: {
            include: {
              authors: {
                include: { author: true }
              }
            }
          }
        }
      }
    }
  });
};

const updateCollection = async (id, userId, data) => {
  const { name, description } = data;
  return prisma.collection.update({
    where: { id, userId },
    data: { name, description }
  });
};

const deleteCollection = async (id, userId) => {
  return prisma.collection.delete({
    where: { id, userId }
  });
};

const addPaperToCollection = async (collectionId, paperId, userId) => {
  // Verify ownership
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId }
  });

  if (!collection) throw new Error("Collection not found or unauthorized");

  return prisma.collectionPaper.create({
    data: {
      collectionId,
      paperId
    }
  });
};

const removePaperFromCollection = async (collectionId, paperId, userId) => {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId }
  });

  if (!collection) throw new Error("Collection not found or unauthorized");

  return prisma.collectionPaper.deleteMany({
    where: {
      collectionId,
      paperId
    }
  });
};

module.exports = {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  addPaperToCollection,
  removePaperFromCollection
};
