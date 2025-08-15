// Komponen CRUD Iuran Bulanan
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function IuranCrud() {
  type Iuran = {
    id?: number;
    blok_rumah: string;
    bulan: string;
    tahun: string;
    jumlah: string;
    status: string;
  };
  const [iuran, setIuran] = useState<Iuran[]>([]);
  const [form, setForm] = useState<Iuran>({ blok_rumah: "", bulan: "", tahun: "", jumlah: "", status: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchIuran = async () => {
    setLoading(true);
    if (!supabase) {
      setIuran([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("iuran").select("*").order("id", { ascending: false });
    setIuran(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchIuran();
  }, []);

  // Handle form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!supabase) return;
    if (editId) {
      await supabase.from("iuran").update(form).eq("id", editId);
    } else {
      await supabase.from("iuran").insert([form]);
    }
  setForm({ blok_rumah: "", bulan: "", tahun: "", jumlah: "", status: "" });
    setEditId(null);
    fetchIuran();
  };

  // Edit
  const handleEdit = (item: Iuran) => {
  setForm({ blok_rumah: item.blok_rumah, bulan: item.bulan, tahun: item.tahun, jumlah: item.jumlah, status: item.status });
    setEditId(item.id ?? null);
  };

  // Delete
  const handleDelete = async (id: number) => {
    setLoading(true);
  if (!supabase) return;
  await supabase.from("iuran").delete().eq("id", id);
    fetchIuran();
  };

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-indigo-50 p-4 rounded-xl shadow">
        <div>
          <label className="block text-sm font-semibold mb-1">Blok Rumah</label>
          <input name="blok_rumah" value={form.blok_rumah} onChange={handleChange} placeholder="Blok Rumah" className="w-full p-2 border rounded text-gray-900 placeholder-gray-500" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Bulan</label>
          <input name="bulan" value={form.bulan} onChange={handleChange} placeholder="Bulan" className="w-full p-2 border rounded text-gray-900 placeholder-gray-500" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tahun</label>
          <input name="tahun" value={form.tahun} onChange={handleChange} placeholder="Tahun" className="w-full p-2 border rounded text-gray-900 placeholder-gray-500" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Jumlah</label>
          <input name="jumlah" value={form.jumlah} onChange={handleChange} placeholder="Jumlah" className="w-full p-2 border rounded text-gray-900 placeholder-gray-500" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded text-gray-900 placeholder-gray-500" required>
            <option value="">Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum">Belum</option>
          </select>
        </div>
        <button type="submit" className="col-span-1 md:col-span-3 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-semibold mt-2">
          {editId ? "Update" : "Tambah"}
        </button>
      </form>
      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm rounded-xl overflow-hidden shadow">
            <thead>
              <tr className="bg-indigo-100">
                <th className="border p-2">Blok Rumah</th>
                <th className="border p-2">Bulan</th>
                <th className="border p-2">Tahun</th>
                <th className="border p-2">Jumlah</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {iuran.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50 transition-all">
                  <td className="border p-2 font-semibold text-indigo-700">{item.blok_rumah}</td>
                  <td className="border p-2">{item.bulan}</td>
                  <td className="border p-2">{item.tahun}</td>
                  <td className="border p-2">{item.jumlah}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === "Lunas" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.status}</span>
                  </td>
                  <td className="border p-2">
                    <button onClick={() => handleEdit(item)} className="mr-2 text-indigo-600 hover:underline font-bold">Edit</button>
                    <button onClick={() => item.id !== undefined && handleDelete(item.id)} className="text-red-500 hover:underline font-bold">Hapus</button>
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
