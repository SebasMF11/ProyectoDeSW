const express = require('express');
const cors = require('cors');

const semesterRoutes = require('./routes/SemesterRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

app.use('/api/semesters', semesterRoutes);

module.exports = app;
