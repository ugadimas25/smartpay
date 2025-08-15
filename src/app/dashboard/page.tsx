"use client";
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import IuranCrud from "./IuranCrud";
import UserPembayaran from "./UserPembayaran";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          router.push("/login");
        } else {
          setUser(data.user);
        }
        setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  const isAdmin = user?.email === "ugadimas@gmail.com";

  return (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 rounded-full p-3 shadow-lg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10v4"/><path d="M16 10v4"/></svg>
          </span>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 tracking-tight">SmartKomplek Dashboard</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100 rounded-xl p-4">
            <div>
              <p className="text-lg text-gray-700">
                Selamat Datang, <span className="font-semibold text-indigo-700">{user?.user_metadata?.nama_kk}</span>
                {user?.user_metadata?.blok_rumah && (
                  <span className="font-semibold text-indigo-700"> | {user.user_metadata.blok_rumah}</span>
                )}
                <span className="font-semibold text-purple-700"> | Teras Country</span>
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${isAdmin ? "bg-yellow-100 text-yellow-700" : "bg-indigo-100 text-indigo-700"}`}>{isAdmin ? "Admin" : "User"}</span>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-sm text-gray-500">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          {isAdmin ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-purple-700">Monitoring Iuran Warga</h2>
              <IuranCrud />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-purple-700">Riwayat & Upload Pembayaran</h2>
              <UserPembayaran user={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
