"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [form, setForm] = useState({
    namaKK: "",
    blokRumah: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!supabase) {
      setError("Supabase client not initialized.");
      return;
    }
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.username,
      password: form.password,
      options: {
        data: {
          nama_kk: form.namaKK,
          blok_rumah: form.blokRumah,
        },
      },
    });
    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("Email sudah terdaftar. Silakan gunakan email lain atau login.");
        alert("Email sudah terdaftar. Silakan gunakan email lain atau login.");
      } else {
        setError(signUpError.message);
        alert(signUpError.message);
      }
    } else {
      setSuccess("Registrasi berhasil! Silakan cek email untuk verifikasi.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-200">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-purple-200 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-tr from-yellow-400 via-yellow-300 to-yellow-500 rounded-full p-3 mb-2 shadow-lg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10v4"/><path d="M16 10v4"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 mb-1 tracking-tight">Register SmartKomplek</h2>
          <span className="text-gray-500 text-sm">Isi data untuk membuat akun baru</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-purple-700 font-semibold mb-1" htmlFor="namaKK">Nama KK</label>
            <input
              id="namaKK"
              type="text"
              name="namaKK"
              placeholder="Nama KK"
              value={form.namaKK}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-purple-50 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-purple-700 font-semibold mb-1" htmlFor="blokRumah">Blok Rumah</label>
            <input
              id="blokRumah"
              type="text"
              name="blokRumah"
              placeholder="Blok Rumah"
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-purple-50 text-gray-900 placeholder-gray-500"
                onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-purple-700 font-semibold mb-1" htmlFor="username">Email</label>
            <input
              id="username"
              type="email"
              name="username"
              placeholder="Email"
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-purple-50 text-gray-900 placeholder-gray-500"
                onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-purple-700 font-semibold mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-purple-50 text-gray-900 placeholder-gray-500"
                onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="w-full py-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-400 text-white font-bold rounded-lg shadow-md hover:scale-105 hover:from-indigo-700 transition-transform duration-150 border-2 border-yellow-300">
            Register
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
        </form>
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.7s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
