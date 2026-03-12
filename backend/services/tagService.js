const prisma = require("../config/prisma");

/**
 * Tag Service
 * Handles categorization of research materials.
 */

const getTags = async () => {
  return prisma.tag.findMany();
};

const createTag = async (name) => {
  return prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name }
  });
};

const tagPaper = async (paperId, tagName) => {
  const tag = await createTag(tagName);
  
  return prisma.paperTag.upsert({
    where: {
      paperId_tagId: {
        paperId,
        tagId: tag.id
      }
    },
    update: {},
    create: {
      paperId,
      tagId: tag.id
    }
  });
};

const untagPaper = async (paperId, tagId) => {
  return prisma.paperTag.delete({
    where: {
      paperId_tagId: {
        paperId,
        tagId
      }
    }
  });
};

module.exports = {
  getTags,
  createTag,
  tagPaper,
  untagPaper
};
