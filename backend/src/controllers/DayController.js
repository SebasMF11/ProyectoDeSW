const dayService = require("../services/DayService");

const validDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

exports.getDays = async (req, res) => {
  try {
    const { course_id } = req.params;

    const days = await dayService.getAll(course_id);

    res.status(200).json({ days });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.createDay = async (req, res) => {
  try {
    const { dayofweek, starttime, endtime, classroom, course_id } = req.body;
    const student_id = req.student.id;

    if (!dayofweek || !starttime || !endtime || !course_id) {
      return res.status(400).json({
        error: "dayofweek, starttime, endtime y course_id son obligatorios",
      });
    }

    if (!validDays.includes(dayofweek.toLowerCase())) {
      return res.status(400).json({
        error: `Día no válido. Usa: ${validDays.join(", ")}`,
      });
    }

    if (starttime >= endtime) {
      return res
        .status(400)
        .json({ error: "La hora de inicio debe ser menor que la hora de fin" });
    }

    const conflict = await dayService.checkConflict(
      dayofweek.toLowerCase(),
      starttime + ":00",
      endtime + ":00",
      student_id,
    );

    if (conflict && conflict.length > 0) {
      return res.status(400).json({
        error: `Ya tienes una clase registrada el ${dayofweek} en ese horario`,
      });
    }

    const day = await dayService.create({
      dayofweek: dayofweek.toLowerCase(),
      starttime: starttime + ":00",
      endtime: endtime + ":00",
      classroom,
      course_id,
    });

    res.status(201).json({
      message: "Día de clase creado correctamente",
      day,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.updateDay = async (req, res) => {
  try {
    const { idday } = req.params;
    const { dayofweek, starttime, endtime, classroom } = req.body;
    const student_id = req.student.id;

    if (dayofweek && !validDays.includes(dayofweek.toLowerCase())) {
      return res.status(400).json({
        error: `Día no válido. Usa: ${validDays.join(", ")}`,
      });
    }

    if (starttime && endtime && starttime >= endtime) {
      return res
        .status(400)
        .json({ error: "La hora de inicio debe ser menor que la hora de fin" });
    }

    if (dayofweek || starttime || endtime) {
      const conflict = await dayService.checkConflict(
        dayofweek?.toLowerCase(),
        starttime ? starttime + ":00" : null,
        endtime ? endtime + ":00" : null,
        student_id,
      );

      if (conflict && conflict.length > 0) {
        return res.status(400).json({
          error: `Ya tienes una clase registrada el ${dayofweek} en ese horario`,
        });
      }
    }

    const result = await dayService.update(idday, student_id, {
      ...(dayofweek && { dayofweek: dayofweek.toLowerCase() }),
      ...(starttime && { starttime: starttime + ":00" }),
      ...(endtime && { endtime: endtime + ":00" }),
      ...(classroom && { classroom }),
    });

    if (!result) {
      return res
        .status(404)
        .json({ error: "Día no encontrado o no tienes permiso para editarlo" });
    }

    res.status(200).json({
      message: "Día actualizado correctamente",
      day: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.deleteDay = async (req, res) => {
  try {
    const { idday } = req.params;
    const student_id = req.student.id;

    const result = await dayService.delete(idday, student_id);

    if (!result) {
      return res
        .status(404)
        .json({
          error: "Día no encontrado o no tienes permiso para eliminarlo",
        });
    }

    res.status(200).json({ message: "Día eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
