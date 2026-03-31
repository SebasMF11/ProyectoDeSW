const semesterService = require("../services/SemesterService");

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

    const end = new Date(endDate + "T00:00:00");
    const finalExam = new Date(end);
    finalExam.setDate(end.getDate() - 6);

    const midDate = new Date(midtermWeek + "T00:00:00");
    const start = new Date(startDate + "T00:00:00");

    if (midDate < start || midDate > end) {
      return res.status(400).json({
        error:
          "The midterm week must be between the start and end dates of the semester",
      });
    }

    const finalExamWeek = finalExam.toISOString().split("T")[0];

    const semester = await semesterService.create({
      semester_name: semesterName,
      start_date: startDate,
      end_date: endDate,
      midterm_week: midtermWeek,
      final_exam_week: finalExamWeek,
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
      const end = new Date(endDate + "T00:00:00");
      const finalExam = new Date(end);
      finalExam.setDate(end.getDate() - 6);
      finalExamWeek = finalExam.toISOString().split("T")[0];
    }

    const semester = await semesterService.update(semesterId, student_id, {
      ...(semesterName && { semester_name: semesterName }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(midtermWeek && { midterm_week: midtermWeek }),
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
