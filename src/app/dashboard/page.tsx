"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import IuranCrud from "./IuranCrud";
import UserPembayaran from "./UserPembayaran";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
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
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-indigo-700">Dashboard {isAdmin ? "Admin" : "User"}</h1>
        <p className="mb-6 text-gray-700">Selamat datang, <span className="font-semibold">{user?.email}</span></p>
        {isAdmin ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-purple-700">Monitoring Iuran Warga</h2>
            <IuranCrud />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-purple-700">Riwayat & Upload Pembayaran</h2>
            <UserPembayaran user={user} />
          </div>
        )}
      </div>
    </div>
  );
}
