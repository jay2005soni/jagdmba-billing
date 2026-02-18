"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function UpdateStockModal({ close, refresh }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [addWeight, setAddWeight] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH INVENTORY ================= */
  useEffect(() => {
    const fetchItems = async () => {
      const snap = await getDocs(collection(db, "inventory"));
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setItems(data);
    };

    fetchItems();
  }, []);

  /* ================= UPDATE STOCK ================= */
  const handleUpdate = async () => {
    if (!selectedId || !addWeight) {
      alert("Select item and enter weight");
      return;
    }

    setLoading(true);

    try {
      const selectedItem = items.find((i) => i.id === selectedId);

      const newTotal =
        parseFloat(selectedItem.weight) + parseFloat(addWeight);

      /* Update main inventory */
      await updateDoc(doc(db, "inventory", selectedId), {
        weight: newTotal,
      });

      /* Save history */
      await addDoc(collection(db, "stockHistory"), {
        itemId: selectedId,
        itemName: selectedItem.name,
        addedWeight: parseFloat(addWeight),
        newTotal,
        type: "ADD",
        createdAt: serverTimestamp(),
      });

      refresh();
      close();
    } catch (err) {
      console.error(err);
      alert("Error updating stock");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h3 className="font-semibold mb-4 text-black">
          Update Existing Stock
        </h3>

        <div className="space-y-3">
          <select
            className="input text-black"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.weight} g)
              </option>
            ))}
          </select>

          <input
            type="number"
            className="input text-black"
            placeholder="Add Weight (g)"
            value={addWeight}
            onChange={(e) => setAddWeight(e.target.value)}
          />

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-yellow-600 text-white w-full py-2 rounded"
          >
            {loading ? "Updating..." : "Update Stock"}
          </button>

          <button
            onClick={close}
            className="text-sm text-gray-500 w-full mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
