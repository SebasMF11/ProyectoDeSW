const supabase = require('../config/supabase');

exports.getAll = async () => {

  const { data, error } = await supabase
    .from('semester')
    .select('*');

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.create = async (semester) => {

  const { data, error } = await supabase
    .from('semester')
    .insert([semester])
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};
