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
// const insightRoutes = require("./routes/insightRoutes");
const visualizationRoutes = require("./routes/visualizationRoutes");


const app = express();

app.use(cors());
app.use(express.json());


app.use("/concepts", conceptRoutes);
app.use("/experiments", experimentRoutes);
// app.use("/insights", insightRoutes);
app.use("/visualization", visualizationRoutes);
app.use("/insights", insightRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/papers", paperRoutes);
app.use("/datasets", datasetRoutes);
app.use("/references", referenceRoutes);
app.use("/workflow/stages", workflowStageRoutes);
app.use("/workflow/items", workflowItemRoutes);

module.exports = app;