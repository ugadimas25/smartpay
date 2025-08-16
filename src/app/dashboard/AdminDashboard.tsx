"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  // Sorting
  type SortConfig = { key: keyof PembayaranRow | keyof PembayaranRow['warga'] | null; direction: 'asc' | 'desc' };
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  // Filter
  const [filter, setFilter] = useState({ nama_kk: '', blok_rumah: '', email: '', bulan: '', tahun: '', status: '' });
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

  // Filtered & sorted data
  const filteredPembayaran = pembayaran.filter((item) => {
    return (
      (!filter.nama_kk || item.warga?.nama_kk?.toLowerCase().includes(filter.nama_kk.toLowerCase())) &&
      (!filter.blok_rumah || item.warga?.blok_rumah?.toLowerCase().includes(filter.blok_rumah.toLowerCase())) &&
      (!filter.email || item.warga?.email?.toLowerCase().includes(filter.email.toLowerCase())) &&
      (!filter.bulan || item.bulan?.toLowerCase().includes(filter.bulan.toLowerCase())) &&
      (!filter.tahun || item.tahun?.toLowerCase().includes(filter.tahun.toLowerCase())) &&
      (!filter.status || item.status?.toLowerCase().includes(filter.status.toLowerCase()))
    );
  });

  const sortedPembayaran = [...filteredPembayaran].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = sortConfig.key in a ? a[sortConfig.key as keyof PembayaranRow] : a.warga?.[sortConfig.key as keyof PembayaranRow['warga']];
    let bValue = sortConfig.key in b ? b[sortConfig.key as keyof PembayaranRow] : b.warga?.[sortConfig.key as keyof PembayaranRow['warga']];
    if (aValue === undefined || bValue === undefined) return 0;
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPembayaran.length / itemsPerPage);
  const paginatedPembayaran = sortedPembayaran.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
  <h2 className="text-2xl font-bold mb-6 text-purple-700">Dashboard Admin</h2>
        {/* Filter satu baris, tulisan jelas */}
  <div className="mb-4 flex gap-2 items-center justify-center">
          <input className="border border-indigo-400 px-3 py-2 rounded text-sm bg-white text-indigo-700 placeholder-indigo-400 font-semibold w-32" placeholder="Nama KK" value={filter.nama_kk} onChange={e => setFilter(f => ({ ...f, nama_kk: e.target.value }))} />
          <input className="border border-indigo-400 px-3 py-2 rounded text-sm bg-white text-indigo-700 placeholder-indigo-400 font-semibold w-32" placeholder="Blok Rumah" value={filter.blok_rumah} onChange={e => setFilter(f => ({ ...f, blok_rumah: e.target.value }))} />
          <input className="border border-indigo-400 px-3 py-2 rounded text-sm bg-white text-indigo-700 placeholder-indigo-400 font-semibold w-32" placeholder="Email" value={filter.email} onChange={e => setFilter(f => ({ ...f, email: e.target.value }))} />
          <input className="border border-indigo-400 px-3 py-2 rounded text-sm bg-white text-indigo-700 placeholder-indigo-400 font-semibold w-24" placeholder="Bulan" value={filter.bulan} onChange={e => setFilter(f => ({ ...f, bulan: e.target.value }))} />
          <input className="border border-indigo-400 px-3 py-2 rounded text-sm bg-white text-indigo-700 placeholder-indigo-400 font-semibold w-20" placeholder="Tahun" value={filter.tahun} onChange={e => setFilter(f => ({ ...f, tahun: e.target.value }))} />
          <input className="border border-indigo-400 px-3 py-2 rounded text-sm bg-white text-indigo-700 placeholder-indigo-400 font-semibold w-24" placeholder="Status" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} />
        </div>
        {loading ? <p>Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-xl shadow bg-white">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => setSortConfig(s => ({ key: 'nama_kk', direction: s.key === 'nama_kk' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Nama KK {sortConfig.key === 'nama_kk' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => setSortConfig(s => ({ key: 'blok_rumah', direction: s.key === 'blok_rumah' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Blok {sortConfig.key === 'blok_rumah' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => setSortConfig(s => ({ key: 'email', direction: s.key === 'email' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Email {sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => setSortConfig(s => ({ key: 'bulan', direction: s.key === 'bulan' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Bulan {sortConfig.key === 'bulan' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => setSortConfig(s => ({ key: 'tahun', direction: s.key === 'tahun' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Tahun {sortConfig.key === 'tahun' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => setSortConfig(s => ({ key: 'status', direction: s.key === 'status' && s.direction === 'asc' ? 'desc' : 'asc' }))}>Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                  <th className="px-4 py-2">Bukti</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPembayaran.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-gray-500">Belum ada pembayaran.</td></tr>
                ) : paginatedPembayaran.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-indigo-50 transition">
                    <td className="px-4 py-2 font-semibold text-indigo-700">{item.warga?.nama_kk}</td>
                    <td className="px-4 py-2 font-semibold text-indigo-700">{item.warga?.blok_rumah}</td>
                    <td className="px-4 py-2 text-indigo-700 font-semibold">{item.warga?.email}</td>
                    <td className="px-4 py-2 text-indigo-700 font-semibold">{item.bulan}</td>
                    <td className="px-4 py-2 text-indigo-700 font-semibold">{item.tahun}</td>
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
            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <button className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-bold" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
              <span className="font-semibold">Halaman {currentPage} / {totalPages}</span>
              <button className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-bold" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
