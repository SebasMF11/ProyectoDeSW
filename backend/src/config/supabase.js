const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY:", process.env.SUPABASE_KEY);

module.exports = supabase;
