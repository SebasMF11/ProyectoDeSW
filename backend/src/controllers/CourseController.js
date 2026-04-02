const courseService = require("../services/CourseService");

const colorMap = {
  red: "#FF5733",
  blue: "#3380FF",
  green: "#33FF57",
  yellow: "#FFD700",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FF69B4",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#808080",
};

exports.getCourses = async (req, res) => {
  try {
    const student_id = req.student.id;
    const courses = await courseService.getAll(student_id);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCoursesBySemester = async (req, res) => {
  try {
    const { semesterName } = req.params;
    const student_id = req.student.id;

    const semester = await courseService.getSemesterByName(
      semesterName,
      student_id,
    );
    if (!semester) {
      return res
        .status(404)
        .json({ error: `Semester "${semesterName}" not found` });
    }

    const courses = await courseService.getBySemester(semester.semester_id);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { courseName, credits, teacher, color, semesterName } = req.body;
    const student_id = req.student.id;

    if (!courseName || !credits || !semesterName) {
      return res
        .status(400)
        .json({ error: "courseName, credits and semesterName are required" });
    }

    const colorHex = colorMap[color?.toLowerCase()];
    if (!colorHex) {
      return res.status(400).json({
        error: `Invalid color. Use: ${Object.keys(colorMap).join(", ")}`,
      });
    }

    const semester = await courseService.getSemesterByName(
      semesterName,
      student_id,
    );
    if (!semester) {
      return res
        .status(404)
        .json({ error: `Semester "${semesterName}" not found` });
    }

    const course = await courseService.create({
      course_name: courseName,
      credits,
      teacher,
      color: colorHex,
      status: true,
      semester_id: semester.semester_id,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student_id = req.student.id;

    const result = await courseService.deleteCourse(courseId, student_id);
    if (!result) {
      return res.status(404).json({
        error: "Course not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseName, credits, teacher, color } = req.body;
    const student_id = req.student.id;

    let colorHex;
    if (color) {
      colorHex = colorMap[color?.toLowerCase()];
      if (!colorHex) {
        return res.status(400).json({
          error: `Invalid color. Use: ${Object.keys(colorMap).join(", ")}`,
        });
      }
    }

    const result = await courseService.updateCourse(courseId, student_id, {
      ...(courseName && { course_name: courseName }),
      ...(credits && { credits }),
      ...(teacher && { teacher }),
      ...(colorHex && { color: colorHex }),
    });

    if (!result) {
      return res.status(404).json({
        error: "Course not found or you don't have permission to edit it",
      });
    }

    res.status(200).json({
      message: "Course updated successfully",
      course: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;
    const student_id = req.student.id;

    if (status === undefined || typeof status !== "boolean") {
      return res.status(400).json({ error: "status must be a boolean value" });
    }

    const result = await courseService.updateStatus(
      courseId,
      student_id,
      status,
    );
    if (!result) {
      return res
        .status(404)
        .json({ error: "Course not found or you don't have permission" });
    }

    res.status(200).json({
      message: `Course ${status ? "activated" : "deactivated"} successfully`,
      course: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
