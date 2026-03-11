require("dotenv").config();

const express = require("express");
const cors = require("cors");

const projectRoutes = require("./routes/projectRoutes");
const paperRoutes = require("./routes/paperRoutes");
const experimentRoutes = require("./routes/experimentRoutes");
const insightRoutes = require("./routes/insightRoutes");
const linkRoutes = require("./routes/linkRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/projects", projectRoutes);
app.use("/papers", paperRoutes);
app.use("/experiments", experimentRoutes);
app.use("/insights", insightRoutes);
app.use("/links", linkRoutes);

app.get("/", (req, res) => {
  res.send("Research Platform API Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});