"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  type PembayaranRow = {
    id: number;
    bulan: string;
    tahun: string;
    status: string;
    bukti_url: string;
    warga?: {
      nama_kk: string;
      blok_rumah: string;
      email: string;
    };
  };
  const [pembayaran, setPembayaran] = useState<PembayaranRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPembayaran = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("pembayaran").select("*, warga(nama_kk, blok_rumah, email)").order("id", { ascending: false });
      setPembayaran((data as PembayaranRow[]) || []);
      setLoading(false);
    };
    fetchAllPembayaran();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Dashboard Admin - Monitoring Pembayaran Warga</h2>
        {loading ? <p>Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-xl shadow bg-white">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-2">Nama KK</th>
                  <th className="px-4 py-2">Blok</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Bulan</th>
                  <th className="px-4 py-2">Tahun</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Bukti</th>
                </tr>
              </thead>
              <tbody>
                {pembayaran.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-gray-500">Belum ada pembayaran.</td></tr>
                ) : pembayaran.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-indigo-50 transition">
                    <td className="px-4 py-2 font-semibold text-indigo-700">{item.warga?.nama_kk}</td>
                    <td className="px-4 py-2 font-semibold text-indigo-700">{item.warga?.blok_rumah}</td>
                    <td className="px-4 py-2">{item.warga?.email}</td>
                    <td className="px-4 py-2">{item.bulan}</td>
                    <td className="px-4 py-2">{item.tahun}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === "Sudah Bayar" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      {item.bukti_url && <a href={item.bukti_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-sm">Lihat Bukti</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
