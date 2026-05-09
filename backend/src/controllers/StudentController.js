const studentService = require("../services/StudentService");
const supabase = require("../config/supabase");

exports.authStudent = async (req, res) => {
  try {
    const { name, lastName, email, password, password2, career_id } = req.body;
    if (!name || !lastName || !email || !password || !password2) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== password2) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    await studentService.authStudent({ name, lastName, email, password, career_id });

    res.status(201).json({
      message: "Confirmation email sent, check your inbox 📧",
    });
  } catch (error) {
    console.error("Error registro:", error);
    if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
      return res.status(429).json({
        error:
          "Too many registration attempts. Please wait a moment before trying again.",
      });
    }
    if (
      error?.name === "AuthRetryableFetchError" ||
      error?.status === 0 ||
      error?.cause?.code === "ENOTFOUND"
    ) {
      return res.status(503).json({
        error:
          "Could not connect to the authentication service. Check your connection and try again.",
      });
    }
    res.status(500).json({ error: "Internal error while registering student" });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const authResult = await studentService.loginStudent({ email, password });

    res.status(200).json({
      token: authResult.session.access_token,
      message: "Login successful",
      user: authResult.user,
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(401).json({ error: error.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student_id = req.student.id;
    const student = await studentService.getStudent(student_id);
    res.status(200).json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, lastName, email, career_id } = req.body;
    const student_id = req.student.id;

    if (!name && !lastName && !email && !career_id) {
      return res.status(400).json({ error: "At least one field is required" });
    }

    if (email) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) {
        return res.status(400).json({ error: authError.message });
      }
    }

    const result = await studentService.updateStudent(student_id, {
      ...(name && { name }),
      ...(lastName && { last_name: lastName }),
      ...(email && { email }),
      ...(career_id && { career_id }),
    });

    res
      .status(200)
      .json({ message: "Profile updated successfully", student: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPassword2 } = req.body;

    if (!currentPassword || !newPassword || !newPassword2) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== newPassword2) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: req.student.email,
      password: currentPassword,
    });

    if (loginError) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await studentService.updatePassword(newPassword);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
