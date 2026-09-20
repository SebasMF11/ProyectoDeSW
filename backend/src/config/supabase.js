require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
