const courseService = require("../services/CourseService");

const colorMap = {
  rojo: "#FF5733",
  azul: "#3380FF",
  verde: "#33FF57",
  amarillo: "#FFD700",
  naranja: "#FFA500",
  morado: "#800080",
  rosado: "#FF69B4",
  negro: "#000000",
  blanco: "#FFFFFF",
  gris: "#808080",
};

exports.getCourses = async (req, res) => {
  try {
    const student_id = req.student.id;
    const courses = await courseService.getAll(student_id);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getCoursesBySemester = async (req, res) => {
  try {
    const { semestername } = req.params;
    const student_id = req.student.id;

    const semester = await courseService.getSemesterByName(
      semestername,
      student_id,
    );
    if (!semester) {
      return res
        .status(404)
        .json({ error: `No se encontró el semestre "${semestername}"` });
    }

    const courses = await courseService.getBySemester(semester.idsemester);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { coursename, credits, teacher, color, semestername } = req.body;
    const student_id = req.student.id;

    if (!coursename || !credits || !semestername) {
      return res
        .status(400)
        .json({ error: "coursename, credits y semestername son obligatorios" });
    }

    // Convertir el color al codigo
    const colorHex = colorMap[color?.toLowerCase()];
    if (!colorHex) {
      return res.status(400).json({
        error: `Color no válido. Usa: ${Object.keys(colorMap).join(", ")}`,
      });
    }

    // Buscar semester_id por nombre
    const semester = await courseService.getSemesterByName(
      semestername,
      student_id,
    );
    if (!semester) {
      return res
        .status(404)
        .json({ error: `No se encontró el semestre "${semestername}"` });
    }

    const course = await courseService.create({
      coursename,
      credits,
      teacher,
      color: colorHex,
      status: true,
      semester_id: semester.idsemester,
    });

    res.status(201).json({
      message: "Materia creada correctamente",
      course: course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { idcourse } = req.params;
    const student_id = req.student.id;

    const result = await courseService.deleteCourse(idcourse, student_id);

    if (!result) {
      return res.status(404).json({
        error: "Materia no encontrada o no tienes permiso para eliminarla",
      });
    }

    res.status(200).json({ message: "Materia eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { idcourse } = req.params;
    const { coursename, credits, teacher, color } = req.body;
    const student_id = req.student.id;

    let colorHex;
    if (color) {
      colorHex = colorMap[color?.toLowerCase()];
      if (!colorHex) {
        return res.status(400).json({
          error: `Color no válido. Usa: ${Object.keys(colorMap).join(", ")}`,
        });
      }
    }

    const result = await courseService.updateCourse(idcourse, student_id, {
      ...(coursename && { coursename }),
      ...(credits && { credits }),
      ...(teacher && { teacher }),
      ...(colorHex && { color: colorHex }),
    });

    if (!result) {
      return res.status(404).json({
        error: "Materia no encontrada o no tienes permiso para editarla",
      });
    }

    res.status(200).json({
      message: "Materia actualizada correctamente",
      course: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
