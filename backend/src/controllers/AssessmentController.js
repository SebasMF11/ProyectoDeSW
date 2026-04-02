const assessmentService = require("../services/AssessmentService");

const validTypes = [
  "midterm",
  "quiz",
  "workshop",
  "project",
  "presentation",
  "lab",
];
const daysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const parseDateRange = (rangeValue) => {
  if (!rangeValue || typeof rangeValue !== "string") {
    return null;
  }

  const trimmed = rangeValue.trim();
  const startStr = trimmed.slice(1).split(",")[0];
  const endExclusiveStr = trimmed.slice(0, -1).split(",")[1];

  if (!startStr || !endExclusiveStr) {
    return null;
  }

  const start = new Date(`${startStr}T00:00:00Z`);
  const endExclusive = new Date(`${endExclusiveStr}T00:00:00Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(endExclusive.getTime())) {
    return null;
  }

  const end = new Date(endExclusive);
  end.setUTCDate(end.getUTCDate() - 1);

  return { start, end };
};

exports.createAssessment = async (req, res) => {
  try {
    const { assessmentName, type, month, day, courseName, percentage } =
      req.body;
    const student_id = req.student.id;

    if (
      !assessmentName ||
      !type ||
      !month ||
      !day ||
      !courseName ||
      !percentage
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validTypes.includes(type.toLowerCase())) {
      return res
        .status(400)
        .json({ error: `Invalid type. Use: ${validTypes.join(", ")}` });
    }

    const course = await assessmentService.getCourseByName(
      courseName,
      student_id,
    );
    if (!course) {
      return res
        .status(404)
        .json({ error: `Course "${courseName}" not found` });
    }

    const year = new Date().getFullYear();
    const duedateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const duedateObj = new Date(duedateStr + "T00:00:00");

    if (isNaN(duedateObj)) {
      return res.status(400).json({ error: "Invalid date" });
    }

    /*
    //validacion MUY diabolica para validar los dias de clase
    const duedayOfWeek = daysOfWeek[duedateObj.getDay()];
    const courseDays = await assessmentService.getDaysByCourse(course.course_id); 

    if (!courseDays || courseDays.length === 0) {
      return res
        .status(400)
        .json({ error: "Este curso no tiene días de clase registrados" });
    }

    const hasClass = courseDays.some(
      (d) => d.day_of_week.toLowerCase() === duedayOfWeek, 
    );
    if (!hasClass) {
      const validDays = courseDays.map((d) => d.day_of_week).join(", "); 
      return res.status(400).json({
        error: `No tienes clase de "${courseName}" ese día. Los días de clase son: ${validDays}`,
      });
    }
    */

    if (type.toLowerCase() === "parcial") {
      const semester = await assessmentService.getSemesterByCourse(
        course.course_id,
      );
      if (!semester) {
        return res
          .status(404)
          .json({ error: "Semester for the course not found" });
      }

      const midtermRange = parseDateRange(semester.midterm_week);

      if (!midtermRange) {
        return res.status(400).json({
          error: "Midterm week range is invalid for this semester",
        });
      }

      const midtermStart = midtermRange.start;
      const midtermEnd = midtermRange.end;

      if (duedateObj < midtermStart || duedateObj > midtermEnd) {
        return res.status(400).json({
          error: `Midterm assessments must be scheduled between ${midtermStart.toLocaleDateString()} and ${midtermEnd.toLocaleDateString()}`,
        });
      }
    }

    if (percentage > 25) {
      return res.status(400).json({
        error: "The percentage of an assessment cannot exceed 25%",
      });
    }

    const existingAssessments = await assessmentService.getTotalPercentage(
      course.course_id,
    );
    if (existingAssessments) {
      const totalPercentage = existingAssessments.reduce(
        (acc, a) => acc + a.percentage,
        0,
      );
      if (totalPercentage + percentage > 100) {
        return res.status(400).json({
          error: `The sum of percentages would exceed 100%. Available percentage: ${100 - totalPercentage}%`,
        });
      }
    }

    const conflict = await assessmentService.checkAssessmentConflict(
      course.course_id,
      duedateStr,
    );
    if (conflict && conflict.length > 0) {
      return res.status(400).json({
        error: `You already have an assessment for "${courseName}" scheduled for that day`,
      });
    }

    const assessment = await assessmentService.create({
      assessment_name: assessmentName,
      type: type.toLowerCase(),
      due_date: duedateStr,
      course_id: course.course_id,
      percentage,
    });

    res
      .status(201)
      .json({ message: "Assessment created successfully", assessment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const student_id = req.student.id;
    const assessments = await assessmentService.getAll(student_id);
    res.status(200).json({ assessments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAssessmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student_id = req.student.id;
    const assessments = await assessmentService.getByCourse(
      courseId,
      student_id,
    );
    res.status(200).json({ assessments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAssessmentsBySemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const student_id = req.student.id;
    const assessments = await assessmentService.getBySemester(
      semesterId,
      student_id,
    );
    res.status(200).json({ assessments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { assessmentName, type, month, day, percentage } = req.body;
    const student_id = req.student.id;

    if (type && !validTypes.includes(type.toLowerCase())) {
      return res
        .status(400)
        .json({ error: `Invalid type. Use: ${validTypes.join(", ")}` });
    }

    let duedateStr;
    if (month && day) {
      const year = new Date().getFullYear();
      duedateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const duedateObj = new Date(duedateStr + "T00:00:00");
      if (isNaN(duedateObj)) {
        return res.status(400).json({ error: "Invalid date" });
      }
    }

    const result = await assessmentService.update(assessmentId, student_id, {
      ...(assessmentName && { assessment_name: assessmentName }),
      ...(type && { type: type.toLowerCase() }),
      ...(duedateStr && { due_date: duedateStr }),
      ...(percentage && { percentage }),
    });

    if (!result) {
      return res.status(404).json({
        error: "Assessment not found or you don't have permission to edit it",
      });
    }

    res.status(200).json({
      message: "Assessment updated successfully",
      assessment: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const student_id = req.student.id;

    const result = await assessmentService.delete(assessmentId, student_id);
    if (!result) {
      return res.status(404).json({
        error: "Assessment not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
