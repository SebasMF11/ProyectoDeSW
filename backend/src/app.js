require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const semesterRoutes = require("./routes/SemesterRoutes");

const studentRoutes = require("./routes/StudentRoutes");

const courseRoutes = require("./routes/CourseRoutes");

const assessmentRoutes = require("./routes/AssessmentRoutes");

const dayRoutes = require("./routes/DayRoutes");

const gradeRoutes = require("./routes/GradeRoutes");

app.use("/grade", gradeRoutes);
app.use("/day", dayRoutes);
app.use("/assessment", assessmentRoutes);
app.use("/course", courseRoutes);
app.use("/semester", semesterRoutes);
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/student", studentRoutes);

app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

module.exports = app;
