const prisma = require("../config/prisma");

/**
 * Activity Logger Middleware
 * Automatically logs mutation requests (POST, PUT, DELETE) to the AuditLog.
 */
const activityLogger = async (req, res, next) => {
  const { method, path, body, user } = req;

  // We are primarily interested in logging actions that change state
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  
  // Skip auth routes to avoid logging sensitive data (though middleware is usually after auth)
  if (path.includes("/users/login") || path.includes("/users/register")) {
    return next();
  }

  // Intercept the response to log the status and potentially the ID of the created entity
  const originalJson = res.json;
  res.json = function (data) {
    res.locals.body = data;
    return originalJson.apply(res, arguments);
  };

  res.on("finish", async () => {
    if (isMutation && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const action = `${method} ${path}`;
        const entityId = res.locals.body?.id || null;
        
        // Basic entity type extraction from path
        let entityType = null;
        if (path.includes("/papers")) entityType = "PAPER";
        else if (path.includes("/projects")) entityType = "PROJECT";
        else if (path.includes("/experiments")) entityType = "EXPERIMENT";
        else if (path.includes("/datasets")) entityType = "DATASET";
        else if (path.includes("/notes")) entityType = "NOTE";

        await prisma.auditLog.create({
          data: {
            userId: user?.userId || null,
            action,
            entityType,
            entityId: entityId ? String(entityId) : null,
            metadata: {
              ip: req.ip,
              userAgent: req.get("user-agent"),
              // Don't log full body for privacy/size, but maybe specific fields if needed
            },
          },
        });
      } catch (error) {
        console.error("Activity logging failed:", error);
      }
    }
  });

  next();
};

module.exports = activityLogger;
