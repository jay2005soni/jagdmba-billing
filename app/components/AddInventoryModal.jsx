"use client";

import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function AddInventoryModal({ close, refresh }) {
  const [name, setName] = useState("");
  const [chainType, setChainType] = useState("");
  const [carat, setCarat] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FINE GOLD LOGIC ================= */
  const calculate24KGold = () => {
    if (!weight || !carat) return 0;

    const wt = parseFloat(weight);

    if (carat === "24") return wt;              // PURE
    if (carat === "22") return wt * 0.9475;
    if (carat === "20") return wt * 0.875;

    return 0;
  };

  /* ================= SAVE STOCK ================= */
  const saveStock = async () => {
    if (!name || !chainType || !carat || !weight) {
      alert("All fields required");
      return;
    }

    setLoading(true);

    try {
      const pureGoldNeeded = calculate24KGold();

      /* ===== FETCH PURE GOLD INVENTORY ===== */
      const pq = query(
        collection(db, "inventory"),
        where("chainType", "==", "Pure"),
        where("carat", "==", "24")
      );

      const psnap = await getDocs(pq);

      if (psnap.empty) {
        alert("Pure gold stock not found");
        setLoading(false);
        return;
      }

      const pureDoc = psnap.docs[0];
      const pureWeight = pureDoc.data().weight;

      if (pureWeight < pureGoldNeeded) {
        alert("Not enough pure gold stock");
        setLoading(false);
        return;
      }

      /* ===== ADD CHAIN INVENTORY ===== */
      await addDoc(collection(db, "inventory"), {
        name,
        category: "Chain",
        chainType,
        carat,
        weight: parseFloat(weight),
        fineGold24: Number(pureGoldNeeded.toFixed(3)),
        createdAt: serverTimestamp(),
      });

      /* ===== DEDUCT PURE GOLD ===== */
      await updateDoc(doc(db, "inventory", pureDoc.id), {
        weight: pureWeight - pureGoldNeeded,
      });

      /* ===== LOW STOCK ALERT (OPTIONAL, FUTURE SAFE) ===== */
      if (parseFloat(weight) < 10) {
        await addDoc(collection(db, "alerts"), {
          type: "LOW_STOCK",
          message: `Low stock: ${name} (${weight} g added)`,
          createdAt: serverTimestamp(),
        });
      }

      refresh();
      close();
    } catch (err) {
      console.error(err);
      alert("Error saving stock");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h3 className="font-semibold mb-4 text-black">
          Add Inventory
        </h3>

        <div className="space-y-3">
          <input
            className="input text-black"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Chain Type */}
          <select
            className="input text-black"
            value={chainType}
            onChange={(e) => setChainType(e.target.value)}
          >
            <option value="">Select Chain Type</option>
            <option value="Regular">Regular</option>
            <option value="Neck Chain">Neck Chain</option>
          </select>

          {/* Carat */}
          <select
            className="input text-black"
            value={carat}
            onChange={(e) => setCarat(e.target.value)}
          >
            <option value="">Select Purity</option>
            <option value="22">22K</option>
            <option value="20">20K</option>
          </select>

          {/* Weight */}
          <input
            className="input text-black"
            type="number"
            placeholder="Weight (g)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />

          {/* Fine Gold */}
          <p className="text-sm text-black">
            24K Gold Required:{" "}
            <b>{calculate24KGold().toFixed(3)} g</b>
          </p>

          <button
            onClick={saveStock}
            disabled={loading}
            className="bg-black text-white w-full py-2 rounded"
          >
            {loading ? "Saving..." : "Save Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
