const supabase = require('../config/supabase');

exports.createStudent = async (student) => {

  const { data, error } = await supabase
    .from('student')
    .insert([student])
    .select();

  if (error) {
    throw error;
  }

  return data;

};
