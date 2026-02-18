"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import AddInventoryModal from "../components/AddInventoryModal";

export default function StockPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // 🔥 Fetch inventory
  const fetchInventory = async () => {
    const snap = await getDocs(collection(db, "inventory"));
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setItems(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 🗑️ Delete item
  const deleteItem = async (id) => {
    const ok = confirm("Are you sure you want to delete this item?");
    if (!ok) return;

    await deleteDoc(doc(db, "inventory", id));
    fetchInventory();
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4 text-black">
        Jewellery Inventory
      </h1>

      <button
        onClick={() => {
          setEditItem(null);
          setOpen(true);
        }}
        className="bg-black text-white px-4 py-2 rounded mb-4"
      >
        + Add Item
      </button>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th>Category</th>
              <th>Net Weight</th>
              <th>Purity</th>
              <th>24K Gold</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-gray-500"
                >
                  No items added
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t bg-white hover:bg-gray-50"
              >
                <td className="p-3 text-left text-black font-medium">
                  {item.name}
                </td>

                <td className="text-center text-black">
                  {item.chainType}
                </td>

                <td className="text-center text-black">
                  {item.weight} g
                </td>

                <td className="text-center text-black">
                  {item.carat}K
                </td>

                <td className="text-center text-black font-semibold">
                  {item.fineGold24} g
                </td>

                <td className="text-center space-x-2">
                  {/* EDIT */}
                  <button
                    onClick={() => {
                      setEditItem(item);
                      setOpen(true);
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                  >
                    Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <AddInventoryModal
          close={() => {
            setOpen(false);
            setEditItem(null);
          }}
          refresh={fetchInventory}
          editData={editItem}
        />
      )}
    </DashboardLayout>
  );
}
