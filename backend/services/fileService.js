const prisma = require('../config/prisma');

/**
 * File Service
 * Handles persistence of file metadata and entity associations.
 */

const createFileRecord = async (data) => {
  const { 
    uploadedById, 
    projectId, 
    fileName, 
    originalName, 
    mimeType, 
    fileSize, 
    storagePath, 
    url,
    entityType, 
    entityId,
    metadata 
  } = data;

  return prisma.file.create({
    data: {
      uploadedById,
      projectId: projectId || null,
      fileName,
      originalName,
      mimeType,
      fileSize,
      storagePath,
      url: url || null,
      entityType,
      entityId: entityId || null,
      metadata: metadata || {}
    }
  });
};

const getFileById = async (id) => {
  return prisma.file.findUnique({
    where: { id },
    include: {
      uploader: {
        select: { username: true }
      }
    }
  });
};

const getFilesByEntity = async (entityType, entityId) => {
  return prisma.file.findMany({
    where: {
      entityType,
      entityId
    },
    orderBy: { createdAt: 'desc' }
  });
};

const deleteFileRecord = async (id) => {
  return prisma.file.delete({
    where: { id }
  });
};

module.exports = {
  createFileRecord,
  getFileById,
  getFilesByEntity,
  deleteFileRecord
};
