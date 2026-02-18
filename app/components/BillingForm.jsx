"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function BillingForm() {
  /* ================= STATES ================= */
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const [allowDue, setAllowDue] = useState(true); // 🔥 NEW

  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedChainId, setSelectedChainId] = useState("");
  const [sellWeight, setSellWeight] = useState("");

  const [previousDue, setPreviousDue] = useState(0);
  const [goldReceived, setGoldReceived] = useState("");

  const [lowStockAlert, setLowStockAlert] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH INVENTORY ================= */
  useEffect(() => {
    const fetchInventory = async () => {
      const snap = await getDocs(collection(db, "inventory"));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(
          item =>
            item.chainType !== "Pure" &&
            item.name !== "Pure Gold"
        );
      setInventory(data);
    };
    fetchInventory();
  }, []);

  /* ================= FETCH CUSTOMER ================= */
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerName) {
        setPreviousDue(0);
        setIsNewCustomer(false);
        setAllowDue(true);
        return;
      }

      const q = query(
        collection(db, "customers"),
        where("name", "==", customerName)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setPreviousDue(0);
        setIsNewCustomer(true);
        setAllowDue(true); // new customer default allow
      } else {
        const data = snap.docs[0].data();
        setPreviousDue(data.totalDue || 0);
        setAllowDue(data.allowDue !== false); // 🔥
        setIsNewCustomer(false);
      }
    };

    fetchCustomer();
  }, [customerName]);

  /* ================= FINE METAL ================= */
  const calculateFineMetal = (wt, carat) => {
    const w = Number(wt);
    if (!w) return 0;
    if (carat === "24") return w;
    if (carat === "22") return w * 0.9475;
    if (carat === "20") return w * 0.875;
    return 0;
  };

  /* ================= ADD ITEM ================= */
  const addItem = () => {
    const chain = inventory.find(i => i.id === selectedChainId);
    if (!chain || !sellWeight) return;

    if (Number(sellWeight) > Number(chain.weight)) {
      alert("❌ Not enough stock");
      return;
    }

    const fine = calculateFineMetal(sellWeight, chain.carat);

    setItems(prev => [
      ...prev,
      {
        chainId: chain.id,
        chainName: chain.name,
        carat: chain.carat,
        soldWeight: Number(sellWeight),
        fineMetal: Number(fine.toFixed(3)),
      },
    ]);

    setSelectedChainId("");
    setSellWeight("");
  };

  const totalFine = items.reduce(
    (sum, i) => sum + i.fineMetal,
    0
  );

  /* ================= SAVE BILL ================= */
  const saveBill = async () => {
    if (!customerName || items.length === 0) {
      alert("Customer & items required");
      return;
    }

    if (isNewCustomer && !mobile) {
      alert("Mobile required for new customer");
      return;
    }

    // 🔥 DUE ACCESS HARD CHECK
    if (!allowDue) {
      if (Number(goldReceived) < Number(totalFine)) {
        alert(
          "❌ Due is BLOCKED for this customer.\nFull gold payment required."
        );
        return;
      }
    }

    setLoading(true);

    try {
      /* ===== CUSTOMER ===== */
      const cq = query(
        collection(db, "customers"),
        where("name", "==", customerName)
      );
      const csnap = await getDocs(cq);

      let customerId;

      if (csnap.empty) {
        const c = await addDoc(collection(db, "customers"), {
          name: customerName,
          mobile,
          totalDue: 0,
          allowDue: true,
          createdAt: serverTimestamp(),
        });
        customerId = c.id;
      } else {
        customerId = csnap.docs[0].id;
      }

      const finalDue =
        previousDue +
        totalFine -
        Number(goldReceived || 0);

      /* ===== SAVE BILL ===== */
      await addDoc(collection(db, "bills"), {
        customerId,
        customerName,
        items,
        previousDue,
        goldReceived: Number(goldReceived || 0),
        totalFine,
        finalDue,
        createdAt: serverTimestamp(),
      });

      /* ===== INVENTORY DEDUCT ===== */
      for (const item of items) {
        const inv = inventory.find(i => i.id === item.chainId);
        const remaining = inv.weight - item.soldWeight;

        await updateDoc(doc(db, "inventory", item.chainId), {
          weight: remaining,
        });

        if (remaining < 10) {
          setLowStockAlert(
            `⚠️ Low stock: ${inv.name} (${remaining.toFixed(
              2
            )}g left)`
          );
        }
      }

      /* ===== PURE GOLD ADD ===== */
      if (Number(goldReceived) > 0) {
        const pq = query(
          collection(db, "inventory"),
          where("chainType", "==", "Pure")
        );
        const psnap = await getDocs(pq);

        if (psnap.empty) {
          await addDoc(collection(db, "inventory"), {
            name: "Pure Gold",
            chainType: "Pure",
            carat: "24",
            weight: Number(goldReceived),
            createdAt: serverTimestamp(),
          });
        } else {
          const pdoc = psnap.docs[0];
          await updateDoc(doc(db, "inventory", pdoc.id), {
            weight:
              (pdoc.data().weight || 0) +
              Number(goldReceived),
          });
        }
      }

      /* ===== UPDATE DUE ===== */
      await updateDoc(doc(db, "customers", customerId), {
        totalDue: finalDue,
      });

      alert("✅ Bill saved");

      setItems([]);
      setGoldReceived("");
      setLowStockAlert("");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving bill");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  /* ================= UI ================= */
return (
  <div className="bg-white p-8 rounded-2xl shadow-lg border">
    <h3 className="text-xl font-semibold mb-6 text-gray-800">
      Jewellery Billing
    </h3>

    {/* Customer */}
    <div className="space-y-3">
      <input
        className="w-full border rounded-lg p-3 text-black"
        placeholder="Customer Name"
        value={customerName}
        onChange={e => setCustomerName(e.target.value)}
      />

      {isNewCustomer && (
        <input
          className="w-full border rounded-lg p-3 text-black"
          placeholder="Mobile Number"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
        />
      )}
    </div>

    {/* Due Info */}
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <p className="text-sm">
        Due Access:{" "}
        <b className={allowDue ? "text-green-600" : "text-red-600"}>
          {allowDue ? "Allowed" : "Blocked"}
        </b>
      </p>

      <p className="text-sm mt-1">
        Previous Due: <b>{previousDue.toFixed(3)} g</b>
      </p>
    </div>

    {/* Add Item */}
    <div className="grid grid-cols-3 gap-3 mt-6">
      <select
        className="border rounded-lg p-3 text-black"
        value={selectedChainId}
        onChange={e => setSelectedChainId(e.target.value)}
      >
        <option value="">Select Chain</option>
        {inventory.map(i => (
          <option key={i.id} value={i.id}>
            {i.name} ({i.weight}g)
          </option>
        ))}
      </select>

      <input
        type="number"
        className="border rounded-lg p-3 text-black"
        placeholder="Weight (g)"
        value={sellWeight}
        onChange={e => setSellWeight(e.target.value)}
      />

      <button
        onClick={addItem}
        className="bg-black hover:bg-gray-800 text-white rounded-lg"
      >
        + Add
      </button>
    </div>

    {/* Items List */}
    {items.length > 0 && (
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        {items.map((i, idx) => (
          <div
            key={idx}
            className="flex justify-between text-sm mb-2"
          >
            <span>
              {i.chainName} ({i.carat}K)
            </span>
            <span>
              {i.soldWeight}g → {i.fineMetal}g
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Totals */}
    <div className="mt-6">
      <p className="text-lg font-semibold">
        Fine Total: {totalFine.toFixed(3)} g
      </p>

      <input
        className="w-full border rounded-lg p-3 mt-3 text-black"
        placeholder="Gold Received (24K g)"
        value={goldReceived}
        onChange={e => setGoldReceived(e.target.value)}
      />
    </div>

    {/* Buttons */}
    <div className="flex gap-4 mt-6">
      <button
        onClick={saveBill}
        disabled={loading}
        className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold"
      >
        {loading ? "Saving..." : "Save Bill"}
      </button>

      <button
        onClick={() => {
          saveBill();
          setTimeout(() => window.print(), 1000);
        }}
        className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-semibold"
      >
        Save & Print
      </button>
    </div>
  </div>
);
}