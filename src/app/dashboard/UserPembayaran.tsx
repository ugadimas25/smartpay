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
  jenis_pembayaran: string;
};
export default function UserPembayaran({ user }: { user: User | null }) {
  const [riwayat, setRiwayat] = useState<Pembayaran[]>([]);
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");
  const [jenisPembayaran, setJenisPembayaran] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch riwayat pembayaran user
  const fetchRiwayat = async () => {
    setLoading(true);
    if (!user || !supabase) {
      setRiwayat([]);
      setLoading(false);
      return;
    }
    let query = supabase.from("pembayaran").select("*, bukti_url").eq("user_id", user.id);
    if (filterBulan) query = query.eq("bulan", filterBulan);
    if (filterTahun) query = query.eq("tahun", filterTahun);
    query = query.order("id", { ascending: false });
    const { data } = await query;
    setRiwayat(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) fetchRiwayat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterBulan, filterTahun]);

  // Handle upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (!file || !bulan || !tahun || !jenisPembayaran || !user) {
      setMessage("Lengkapi semua data, pilih jenis pembayaran, dan upload file bukti!");
      setLoading(false);
      return;
    }
    // Upload file ke Supabase Storage
    if (!supabase) {
      setMessage("Supabase client tidak tersedia.");
      setLoading(false);
      return;
    }
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
  jenis_pembayaran: jenisPembayaran,
  bukti_url,
  status: "Sudah Bayar",
    });
    setMessage("Bukti pembayaran berhasil diupload!");
    setFile(null);
  setBulan("");
  setTahun("");
  setJenisPembayaran("");
    fetchRiwayat();
    setLoading(false);
  };

  return (
    <div>
  <form onSubmit={handleUpload} className="mb-6 flex flex-wrap gap-4 items-end bg-indigo-50 p-4 rounded-xl shadow">
  <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1">Jenis Pembayaran</label>
          <select value={jenisPembayaran} onChange={e => setJenisPembayaran(e.target.value)} className="w-56 p-2 border rounded text-gray-900 placeholder-gray-500" required>
            <option value="">Pilih Jenis Pembayaran</option>
            <option value="IPL">IPL</option>
            <option value="CCTV">CCTV</option>
            <option value="Iuran Bulanan Gang H Genap J Ganjil">Iuran Bulanan Gang H Genap J Ganjil</option>
            <option value="Dan lain lain">Dan lain lain</option>
          </select>
        </div>
  <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1">Bulan</label>
          <select value={bulan} onChange={e => setBulan(e.target.value)} className="w-56 p-2 border rounded text-gray-900 placeholder-gray-500" required>
            <option value="">Pilih Bulan</option>
            {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
  <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1">Tahun</label>
          <input type="number" value={tahun} onChange={e => setTahun(e.target.value)} className="w-40 p-2 border rounded text-gray-900 placeholder-gray-500" required min="2020" max="2100" placeholder="Contoh: 2025" />
        </div>
  <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1">Upload Bukti</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-56 p-2 border rounded text-gray-900 placeholder-gray-500" required />
        </div>
        <button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 font-semibold" disabled={loading}>
          {loading ? "Uploading..." : "Upload Bukti Pembayaran"}
        </button>
      </form>
      {message && <p className="mb-4 text-center text-sm text-green-600">{message}</p>}
      <h3 className="text-lg font-bold mb-2 text-purple-700">Riwayat Pembayaran</h3>
      <div className="flex gap-4 mb-4">
        <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className="p-2 border rounded text-gray-900">
          <option value="">Filter Bulan</option>
          {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <input type="number" value={filterTahun} onChange={e => setFilterTahun(e.target.value)} placeholder="Filter Tahun" className="p-2 border rounded text-gray-900 w-32" min="2020" max="2100" />
        <button
          type="button"
          className="p-2 px-4 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 transition"
          onClick={() => { setFilterBulan(""); setFilterTahun(""); }}
        >
          Hapus Filter
        </button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-xl shadow bg-white">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-2">Jenis</th>
                <th className="px-4 py-2">Bulan</th>
                <th className="px-4 py-2">Tahun</th>
                <th className="px-4 py-2">Blok</th>
                <th className="px-4 py-2">Nama KK</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Bukti</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4 text-gray-500">Belum ada pembayaran.</td></tr>
              ) : riwayat.map(item => (
                <tr key={item.id} className="border-b hover:bg-indigo-50 transition">
                  <td className="px-4 py-2 font-semibold text-indigo-700">{item.jenis_pembayaran}</td>
                  <td className="px-4 py-2 font-semibold text-indigo-700">{item.bulan}</td>
                  <td className="px-4 py-2 font-semibold text-indigo-700">{item.tahun}</td>
                  <td className="px-4 py-2 font-semibold text-indigo-700">{item.blok_rumah}</td>
                  <td className="px-4 py-2 font-semibold text-indigo-700">{item.nama_kk}</td>
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
  );
}
