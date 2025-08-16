"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (isRegister) {
      // Register
      if (!supabase) {
        setError("Supabase client not initialized.");
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Registrasi berhasil! Silakan cek email untuk verifikasi, lalu login.");
        setIsRegister(false);
      }
    } else {
      // Login
      if (!supabase) {
        setError("Supabase client not initialized.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        // Setelah login sukses, cek dan insert ke tabel warga jika belum ada
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: wargaData, error: wargaError } = await supabase.from("warga").select("id").eq("id", userData.user.id);
          if (wargaError) {
            setError("Gagal cek warga: " + wargaError.message);
            return;
          }
          if (!wargaData || wargaData.length === 0) {
            const { error: insertError } = await supabase.from("warga").insert({
              id: userData.user.id,
              nama_kk: userData.user.user_metadata?.nama_kk || "",
              blok_rumah: userData.user.user_metadata?.blok_rumah || "",
              email: userData.user.email
            });
            if (insertError) {
              if (insertError.message.includes("duplicate key value")) {
                // Sudah ada, tidak perlu insert
                setError("Data warga sudah terdaftar.");
                router.push("/dashboard");
                return;
              } else {
                setError("Gagal insert warga: " + insertError.message);
                return;
              }
            }
          }
        }
        router.push("/dashboard");
      }
    }
  };

  return (


    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-200">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-purple-200 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-tr from-yellow-400 via-yellow-300 to-yellow-500 rounded-full p-3 mb-2 shadow-lg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10v4"/><path d="M16 10v4"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 mb-1 tracking-tight">SmartPay</h2>
          <span className="text-gray-500 text-sm">Effortlessly manage, and track your community bills.</span>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-purple-700 font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-purple-50 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-purple-700 font-semibold mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-purple-50 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-400 text-white font-bold rounded-lg shadow-md hover:scale-105 hover:from-indigo-700 transition-transform duration-150 border-2 border-yellow-300"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <a
            href="/register"
            className="text-indigo-600 hover:underline font-semibold"
          >
            Belum punya akun? Register
          </a>
          <div className="mt-3">
            <a
              href="https://intesa-global.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-gray-500 hover:text-indigo-600 font-semibold transition underline"
            >
              Support By Integra Tekno Nusa
            </a>
          </div>
        </div>
      </div>
  {/* Support By Integra Tekno Nusa hanya tampil di bawah tombol register/login */}
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
