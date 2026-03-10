require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const semesterRoutes = require('./routes/SemesterRoutes');

const studentRoutes = require('./routes/StudentRoutes');

app.use("/semester", semesterRoutes);

app.use('/student', studentRoutes);

app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

module.exports = app;
