const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const paperRoutes = require("./routes/paperRoutes");
const datasetRoutes = require("./routes/datasetRoutes");
const referenceRoutes = require("./routes/referenceRoutes");
const workflowStageRoutes = require("./routes/workflowStageRoutes");
const workflowItemRoutes = require("./routes/workflowItemRoutes");
const conceptRoutes = require("./routes/conceptRoutes");
const insightRoutes = require("./routes/insightRoutes");
const experimentRoutes = require("./routes/experimentRoutes");
const visualizationRoutes = require("./routes/visualizationRoutes");
const linkRoutes = require("./routes/linkRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const noteRoutes = require("./routes/noteRoutes");
const tagRoutes = require("./routes/tagRoutes");
const aiRoutes = require("./routes/aiRoutes");
const activityRoutes = require("./routes/activityRoutes");
const searchRoutes = require("./routes/searchRoutes");
const fileRoutes = require("./routes/fileRoutes"); // Added
const activityLogger = require("./middleware/activityLogger");
const path = require("path"); // Added


const app = express();

app.use(cors());
app.use(express.json());
app.use(activityLogger);


app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/papers", paperRoutes);
app.use("/datasets", datasetRoutes);
app.use("/references", referenceRoutes);
app.use("/workflow/stages", workflowStageRoutes);
app.use("/workflow/items", workflowItemRoutes);
app.use("/concepts", conceptRoutes);
app.use("/insights", insightRoutes);
app.use("/experiments", experimentRoutes);
app.use("/visualization", visualizationRoutes);
app.use("/links", linkRoutes);
app.use("/collections", collectionRoutes);
app.use("/notes", noteRoutes);
app.use("/tags", tagRoutes);
app.use("/ai", aiRoutes);
app.use("/activity", activityRoutes);
app.use("/search", searchRoutes);
app.use("/files", fileRoutes);

// Serve uploads folder statically in development
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;