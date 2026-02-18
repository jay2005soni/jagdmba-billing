"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
  });

  /* ================= FETCH CUSTOMERS ================= */
  const fetchCustomers = async () => {
    const snap = await getDocs(collection(db, "customers"));
    const data = snap.docs.map(d => ({
      id: d.id,
      allowDue: d.data().allowDue !== false, // default TRUE
      ...d.data(),
    }));
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= TOGGLE DUE ACCESS ================= */
  const toggleDueAccess = async (id, current) => {
    await updateDoc(doc(db, "customers", id), {
      allowDue: !current,
    });
    fetchCustomers();
  };

  /* ================= CLEAR DUE ================= */
  const clearDue = async (id) => {
    if (!confirm("Clear customer due?")) return;

    await updateDoc(doc(db, "customers", id), {
      totalDue: 0,
    });

    fetchCustomers();
  };

  /* ================= EDIT ================= */
  const startEdit = (cust) => {
    setEditing(cust.id);
    setForm({
      name: cust.name,
      mobile: cust.mobile || "",
    });
  };

  const saveEdit = async (id) => {
    await updateDoc(doc(db, "customers", id), {
      name: form.name,
      mobile: form.mobile,
    });

    setEditing(null);
    fetchCustomers();
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4 text-black">
        Customers
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th>Mobile</th>
              <th>Due (g)</th>
              <th>Due Access</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t text-center">
                {/* NAME */}
                <td className="p-3 text-left text-black">
                  {editing === c.id ? (
                    <input
                      className="border px-2 py-1 rounded w-full"
                      value={form.name}
                      onChange={e =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  ) : (
                    c.name
                  )}
                </td>

                {/* MOBILE */}
                <td className="text-black">
                  {editing === c.id ? (
                    <input
                      className="border px-2 py-1 rounded"
                      value={form.mobile}
                      onChange={e =>
                        setForm({
                          ...form,
                          mobile: e.target.value,
                        })
                      }
                    />
                  ) : (
                    c.mobile || "-"
                  )}
                </td>

                {/* DUE */}
                <td
                  className={`font-semibold ${
                    c.totalDue > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {Number(c.totalDue || 0).toFixed(3)}
                </td>

                {/* DUE ACCESS */}
                <td>
                  <button
                    onClick={() =>
                      toggleDueAccess(c.id, c.allowDue)
                    }
                    className={`px-3 py-1 rounded text-white ${
                      c.allowDue
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {c.allowDue ? "Allowed" : "Blocked"}
                  </button>
                </td>

                {/* ACTIONS */}
                <td className="space-x-2">
                  <Link
                    href={`/customers/${c.id}`}
                    className="bg-gray-800 text-white px-3 py-1 rounded"
                  >
                    View
                  </Link>

                  {editing === c.id ? (
                    <button
                      onClick={() => saveEdit(c.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(c)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}

                  {c.totalDue > 0 && (
                    <button
                      onClick={() => clearDue(c.id)}
                      className="bg-black text-white px-3 py-1 rounded"
                    >
                      Disable Due
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
