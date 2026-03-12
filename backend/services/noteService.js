const prisma = require("../config/prisma");

/**
 * Note Service
 * Handles user notes on specific papers within projects.
 */

const createNote = async (userId, data) => {
  const { paperId, projectId, content } = data;
  return prisma.paperNote.create({
    data: {
      content,
      paperId,
      projectId,
      userId
    }
  });
};

const getNotesByPaper = async (paperId, userId) => {
  return prisma.paperNote.findMany({
    where: { paperId, userId },
    orderBy: { updatedAt: "desc" }
  });
};

const updateNote = async (id, userId, content) => {
  return prisma.paperNote.update({
    where: { id, userId },
    data: { content }
  });
};

const deleteNote = async (id, userId) => {
  return prisma.paperNote.delete({
    where: { id, userId }
  });
};

module.exports = {
  createNote,
  getNotesByPaper,
  updateNote,
  deleteNote
};
