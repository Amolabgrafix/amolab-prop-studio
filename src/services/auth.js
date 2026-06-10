import { supabase } from "../lib/supabase";

export async function signUpUser(formData) {
  return await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        username: formData.username,
        full_name: formData.fullName,
        phone: formData.phone,
        role: formData.role,
      },
    },
  });
}

export async function signInUser(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOutUser() {
  return await supabase.auth.signOut();
}