const supabase = require("../config/supabase");

/**
 * FUNCIÓN: loginStudent
 * PROPÓSITO: Autenticar estudiante y obtener token JWT
 *
 * FLUJO:
 * 1. Enviar email/password a Supabase Auth
 * 2. Supabase retorna JWT token si credenciales son válidas
 * 3. Verificar si existe registro en tabla 'student'
 * 4. Si no existe, crear registro con datos de Auth
 * 5. Retornar token y datos del usuario
 *
 * ENTRADA: { email, password }
 * SALIDA: { session: { access_token, ... }, user: {...} }
 *
 * ERRORES:
 * - Credenciales inválidas → error de Supabase Auth
 * - Problema accediendo tabla student → error de BD
 */
exports.loginStudent = async ({ email, password }) => {
  // Paso 1: Autenticar contra Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Paso 2: Verificar si existe registro en tabla 'student'
  const { data: existing, error: checkError } = await supabase
    .from("student")
    .select("*")
    .eq("student_id", data.user.id);

  if (checkError) {
    console.error(checkError);
    throw checkError;
  }

  // Paso 3: Si no existe, crear registro en tabla 'student'
  if (!existing || existing.length === 0) {
    const { error: insertError } = await supabase.from("student").insert({
      student_id: data.user.id,
      name: data.user.user_metadata?.name || "",
      last_name: data.user.user_metadata?.lastName || "",
      email: data.user.email,
    });

    if (insertError) {
      console.error(insertError);
      throw insertError;
    }
  }

  // Retornar datos de autenticación
  return data;
};

exports.authStudent = async (student) => {
  const { name, lastName, email, password } = student;

  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Guardar nombre en user_metadata (accesible después)
      data: {
        name,
        lastName,
      },
    },
  });

  if (error) {
    console.error(error);
    throw error;
  }

  // Supabase automáticamente envía email de confirmación
  return data;
};

exports.updateStudent = async (student_id, fields) => {
  const { data, error } = await supabase
    .from("student")
    .update(fields)
    .eq("student_id", student_id)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.updatePassword = async (password) => {
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) throw error;
  return data;
};
