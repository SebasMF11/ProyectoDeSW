const gradeService = require("../services/GradeService");

exports.createGrade = async (req, res) => {
  try {
    const { assessmentName, value, courseName } = req.body;
    const student_id = req.student.id;

    if (!assessmentName || value === undefined) {
      return res
        .status(400)
        .json({ error: "assessmentName and value are required" });
    }

    if (value < 0 || value > 5) {
      return res
        .status(400)
        .json({ error: "The grade must be between 0.0 and 5.0" });
    }

    const assessment = await gradeService.getAssessmentByName(
      assessmentName,
      student_id,
    );
    if (!assessment) {
      return res
        .status(404)
        .json({ error: "Assessment not found or you don't have permission" });
    }

    const existing = await gradeService.checkGradeExists(
      assessment.name,
      student_id,
    );
    if (existing) {
      return res
        .status(400)
        .json({ error: "This assessment already has a grade assigned" });
    }

    const grade = await gradeService.create({
      assessment_id: assessment.assessment_id,
      value,
    });

    res.status(201).json({ message: "Grade created successfully", grade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getGradesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student_id = req.student.id;

    const grades = await gradeService.getByCourse(courseId, student_id);
    res.status(200).json({ grades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { value } = req.body;
    const student_id = req.student.id;

    if (value === undefined) {
      return res.status(400).json({ error: "value is required" });
    }

    if (value < 0 || value > 5) {
      return res
        .status(400)
        .json({ error: "The grade must be between 0.0 and 5.0" });
    }

    const result = await gradeService.update(gradeId, student_id, value);

    if (!result) {
      return res.status(404).json({
        error: "Grade not found or you don't have permission to edit it",
      });
    }

    res
      .status(200)
      .json({ message: "Grade updated successfully", grade: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const student_id = req.student.id;

    const result = await gradeService.delete(gradeId, student_id);

    if (!result) {
      return res.status(404).json({
        error: "Grade not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
