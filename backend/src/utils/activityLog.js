// Best-effort activity logging. `db` is either the prisma client or a
// transaction client — pass the tx when logging inside a transaction so the
// log entry rolls back with the operation it describes.
async function logActivity(db, projectId, { action, entityType, entityId, metadata }) {
  try {
    await db.activityLog.create({
      data: { projectId, action, entityType, entityId, metadata }
    });
  } catch (error) {
    // Activity logging must never break the operation it observes.
    console.error("activityLog write failed:", error.message);
  }
}

module.exports = { logActivity };
