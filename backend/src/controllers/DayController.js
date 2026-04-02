const dayService = require("../services/DayService");

const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

exports.getDays = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student_id = req.student.id;
    const days = await dayService.getAll(courseId, student_id);
    res.status(200).json({ days });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createDay = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, classroom, courseName } = req.body;
    const student_id = req.student.id;

    if (!dayOfWeek || !startTime || !endTime || !courseName) {
      return res.status(400).json({
        error: "dayOfWeek, startTime, endTime and courseName are required",
      });
    }

    if (!validDays.includes(dayOfWeek.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid day. Use: ${validDays.join(", ")}`,
      });
    }

    if (startTime >= endTime) {
      return res
        .status(400)
        .json({ error: "The start time must be earlier than the end time" });
    }

    const course = await dayService.getCourseByName(courseName, student_id);
    if (!course) {
      return res
        .status(404)
        .json({ error: `Course "${courseName}" not found` });
    }

    const conflict = await dayService.checkConflict(
      dayOfWeek.toLowerCase(),
      startTime + ":00",
      endTime + ":00",
      student_id,
    );

    if (conflict && conflict.length > 0) {
      return res.status(400).json({
        error: `You already have a class registered on ${dayOfWeek} at that time`,
      });
    }

    const day = await dayService.create(
      {
        day_of_week: dayOfWeek.toLowerCase(),
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        classroom,
        course_id: course.course_id,
      },
      student_id,
    );

    if (!day) {
      return res
        .status(404)
        .json({ error: "Course not found or you don't have permission" });
    }

    res.status(201).json({ message: "Day created successfully", day });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateDay = async (req, res) => {
  try {
    const { dayId } = req.params;
    const { dayOfWeek, startTime, endTime, classroom } = req.body;
    const student_id = req.student.id;

    if (dayOfWeek && !validDays.includes(dayOfWeek.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid day. Use: ${validDays.join(", ")}`,
      });
    }

    if (startTime && endTime && startTime >= endTime) {
      return res
        .status(400)
        .json({ error: "The start time must be earlier than the end time" });
    }

    if (dayOfWeek || startTime || endTime) {
      const conflict = await dayService.checkConflict(
        dayOfWeek?.toLowerCase(),
        startTime ? startTime + ":00" : null,
        endTime ? endTime + ":00" : null,
        student_id,
      );

      if (conflict && conflict.length > 0) {
        return res.status(400).json({
          error: `You already have a class registered on ${dayOfWeek} at that time`,
        });
      }
    }

    const result = await dayService.update(dayId, student_id, {
      ...(dayOfWeek && { day_of_week: dayOfWeek.toLowerCase() }),
      ...(startTime && { start_time: startTime + ":00" }),
      ...(endTime && { end_time: endTime + ":00" }),
      ...(classroom && { classroom }),
    });

    if (!result) {
      return res.status(404).json({
        error: "Day not found or you don't have permission to edit it",
      });
    }

    res.status(200).json({ message: "Day updated successfully", day: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteDay = async (req, res) => {
  try {
    const { dayId } = req.params;
    const student_id = req.student.id;

    const result = await dayService.delete(dayId, student_id);

    if (!result) {
      return res.status(404).json({
        error: "Day not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({ message: "Day deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
