// Komponen pembayaran user: upload bukti dan riwayat pembayaran
"use client";
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabaseClient";

type Pembayaran = {
  id: number;
  bulan: string;
  tahun: string;
  bukti_url: string;
  blok_rumah: string;
  nama_kk: string;
  status: string;
};
export default function UserPembayaran({ user }: { user: User | null }) {
  const [riwayat, setRiwayat] = useState<Pembayaran[]>([]);
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch riwayat pembayaran user
  const fetchRiwayat = async () => {
    setLoading(true);
    if (!user) return;
    const { data } = await supabase
      .from("pembayaran")
      .select("*, bukti_url")
      .eq("user_id", user.id)
      .order("id", { ascending: false });
    setRiwayat(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) fetchRiwayat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (!file || !bulan || !tahun || !user) {
      setMessage("Lengkapi semua data dan upload file bukti!");
      setLoading(false);
      return;
    }
    // Upload file ke Supabase Storage
    const fileName = `${user.id}_${bulan}_${tahun}_${Date.now()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("bukti-pembayaran")
      .upload(fileName, file);
    if (uploadError) {
      setMessage("Gagal upload bukti pembayaran.");
      setLoading(false);
      return;
    }
    const bukti_url = uploadData?.path
      ? supabase.storage.from("bukti-pembayaran").getPublicUrl(uploadData.path).data.publicUrl
      : "";
    // Simpan data pembayaran
    await supabase.from("pembayaran").insert({
      user_id: user.id,
      nama_kk: user.user_metadata?.nama_kk,
      blok_rumah: user.user_metadata?.blok_rumah,
      bulan,
      tahun,
      bukti_url,
      status: "Sudah Bayar",
    });
    setMessage("Bukti pembayaran berhasil diupload!");
    setFile(null);
    setBulan("");
    setTahun("");
    fetchRiwayat();
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleUpload} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-indigo-50 p-4 rounded-xl shadow">
        <div>
          <label className="block text-sm font-semibold mb-1">Bulan</label>
          <select value={bulan} onChange={e => setBulan(e.target.value)} className="w-full p-2 border rounded text-gray-900 placeholder-gray-500" required>
            <option value="">Pilih Bulan</option>
            {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tahun</label>
          <input type="number" value={tahun} onChange={e => setTahun(e.target.value)} className="w-full p-2 border rounded text-gray-900 placeholder-gray-500" required min="2020" max="2100" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Upload Bukti</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded text-gray-900 placeholder-gray-500" required />
        </div>
        <button type="submit" className="col-span-1 md:col-span-3 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-semibold mt-2" disabled={loading}>
          {loading ? "Uploading..." : "Upload Bukti Pembayaran"}
        </button>
      </form>
      {message && <p className="mb-4 text-center text-sm text-green-600">{message}</p>}
      <h3 className="text-lg font-bold mb-2 text-purple-700">Riwayat Pembayaran</h3>
      {loading ? <p>Loading...</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {riwayat.length === 0 ? <p className="text-gray-500">Belum ada pembayaran.</p> : riwayat.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-indigo-700">{item.bulan} {item.tahun}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === "Sudah Bayar" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.status}</span>
              </div>
              <div className="mb-2 text-sm text-gray-700">Blok: <span className="font-semibold">{item.blok_rumah}</span></div>
              <div className="mb-2 text-sm text-gray-700">Nama KK: <span className="font-semibold">{item.nama_kk}</span></div>
              {item.bukti_url && <a href={item.bukti_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-sm">Lihat Bukti</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
