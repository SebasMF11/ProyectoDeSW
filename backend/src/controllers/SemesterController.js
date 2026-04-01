const semesterService = require("../services/SemesterService");

const formatDate = (date) => date.toISOString().split("T")[0];

const toDate = (dateString) => new Date(`${dateString}T00:00:00Z`);

const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const toDateRange = (startDateString, days) => {
  const start = toDate(startDateString);
  const endExclusive = addDays(start, days);
  return `[${formatDate(start)},${formatDate(endExclusive)})`;
};

const getFinalExamWeekRange = (endDateString) => {
  const end = toDate(endDateString);
  const finalExamStart = addDays(end, -7);
  const finalExamEndExclusive = addDays(end, 1);
  return `[${formatDate(finalExamStart)},${formatDate(finalExamEndExclusive)})`;
};

exports.getSemester = async (req, res) => {
  try {
    const student_id = req.student.id;
    const semesters = await semesterService.getAll(student_id);
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: "Error fetching semesters" });
  }
};

exports.createSemester = async (req, res) => {
  try {
    const { semesterName, startDate, endDate, midtermWeek } = req.body;
    const student_id = req.student.id;

    const midtermWeekRange = toDateRange(midtermWeek, 7);
    const finalExamWeekRange = getFinalExamWeekRange(endDate);

    const semester = await semesterService.create({
      semester_name: semesterName,
      start_date: startDate,
      end_date: endDate,
      midterm_week: midtermWeekRange,
      final_exam_week: finalExamWeekRange,
      student_id,
    });

    res.status(201).json({
      message: "Semester created successfully",
      semester,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const { semesterName, startDate, endDate, midtermWeek } = req.body;
    const student_id = req.student.id;

    let finalExamWeek;
    if (endDate) {
      finalExamWeek = getFinalExamWeekRange(endDate);
    }

    let midtermWeekRange;
    if (midtermWeek) {
      midtermWeekRange = toDateRange(midtermWeek, 7);
    }

    const semester = await semesterService.update(semesterId, student_id, {
      ...(semesterName && { semester_name: semesterName }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(midtermWeekRange && { midterm_week: midtermWeekRange }),
      ...(finalExamWeek && { final_exam_week: finalExamWeek }),
    });

    res.status(200).json({
      message: "Semester updated successfully",
      semester,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
