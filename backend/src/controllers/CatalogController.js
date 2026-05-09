const catalogService = require("../services/CatalogService");

exports.getCareers = async (req, res) => {
  try {
    const careers = await catalogService.getAllCareers();
    res.status(200).json({ careers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFaculties = async (req, res) => {
  try {
    const faculties = await catalogService.getAllFaculties();
    res.status(200).json({ faculties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCoursesCatalog = async (req, res) => {
  try {
    const courses = await catalogService.getAllCourses();
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCoursesCatalogByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const courses = await catalogService.getCoursesByFaculty(facultyId);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCoursesCatalogByCareer = async (req, res) => {
  try {
    const { careerId } = req.params;
    const courses = await catalogService.getCoursesByCareer(careerId);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
