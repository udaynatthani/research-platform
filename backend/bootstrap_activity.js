const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function bootstrap() {
  console.log('Bootstrapping activity logs from existing data...');
  
  // 1. Papers
  const papers = await prisma.paper.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  for (const paper of papers) {
    await prisma.auditLog.upsert({
      where: { id: `paper-${paper.id}` },
      update: {},
      create: {
        id: `paper-${paper.id}`,
        action: 'POST /papers',
        entityType: 'PAPER',
        entityId: paper.id,
        createdAt: paper.createdAt,
        metadata: { info: 'Bootstrapped from existing paper' }
      }
    });
  }
  console.log(`Log entries created for ${papers.length} papers.`);

  // 2. Notes
  const notes = await prisma.paperNote.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: true } });
  for (const note of notes) {
    await prisma.auditLog.upsert({
      where: { id: `note-${note.id}` },
      update: {},
      create: {
        id: `note-${note.id}`,
        action: 'POST /notes',
        entityType: 'NOTE',
        entityId: note.id,
        userId: note.userId,
        createdAt: note.createdAt,
        metadata: { info: 'Bootstrapped from existing note' }
      }
    });
  }
  console.log(`Log entries created for ${notes.length} notes.`);

  // 3. Collections
  const collections = await prisma.collection.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  for (const col of collections) {
    await prisma.auditLog.upsert({
      where: { id: `col-${col.id}` },
      update: {},
      create: {
        id: `col-${col.id}`,
        action: 'POST /collections',
        entityType: 'COLLECTION',
        entityId: col.id,
        userId: col.userId,
        createdAt: col.createdAt,
        metadata: { info: 'Bootstrapped from existing collection' }
      }
    });
  }
  console.log(`Log entries created for ${collections.length} collections.`);

  console.log('Bootstrap complete!');
}

bootstrap()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
