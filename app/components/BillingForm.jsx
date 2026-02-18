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

export default function BillingForm({ setBillingData }) {
  /* ================= STATES ================= */
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const [allowDue, setAllowDue] = useState(true);
  const [previousDue, setPreviousDue] = useState(0);

  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedChainId, setSelectedChainId] = useState("");
  const [sellWeight, setSellWeight] = useState("");

  const [goldReceived, setGoldReceived] = useState("");

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
        setAllowDue(true);
        setIsNewCustomer(false);
        return;
      }

      const q = query(
        collection(db, "customers"),
        where("name", "==", customerName)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setPreviousDue(0);
        setAllowDue(true);
        setIsNewCustomer(true);
      } else {
        const data = snap.docs[0].data();
        setPreviousDue(Number(data.totalDue || 0));
        setAllowDue(data.allowDue !== false);
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

  const finalBalance =
    previousDue +
    totalFine -
    Number(goldReceived || 0);

  /* ================= 🔥 LIVE SUMMARY UPDATE ================= */
  useEffect(() => {
    if (!setBillingData) return;

    setBillingData({
      totalFine,
      goldReceived: Number(goldReceived || 0),
      previousDue,
    });
  }, [totalFine, goldReceived, previousDue, setBillingData]);

  /* ================= SAVE BILL ================= */
const saveBill = async () => {
  if (!customerName || items.length === 0) {
    alert("Customer & items required");
    return false;
  }

  if (isNewCustomer && !mobile) {
    alert("Mobile required for new customer");
    return false;
  }

  if (!allowDue && finalBalance > 0) {
    alert("❌ Due is BLOCKED for this customer.");
    return false;
  }

  setLoading(true);

  try {
    /* ================= CUSTOMER SAVE ================= */
    const cq = query(
      collection(db, "customers"),
      where("name", "==", customerName)
    );
    const csnap = await getDocs(cq);

    let customerId;

    if (csnap.empty) {
      const newCustomer = await addDoc(
        collection(db, "customers"),
        {
          name: customerName,
          mobile,
          totalDue: finalBalance,
          allowDue: true,
          createdAt: serverTimestamp(),
        }
      );
      customerId = newCustomer.id;
    } else {
      customerId = csnap.docs[0].id;
const updatedDue = finalBalance > 0 ? finalBalance : 0;

await updateDoc(doc(db, "customers", customerId), {
  totalDue: updatedDue,
});

    }

    /* ================= 🔥 STOCK UPDATE ================= */
    for (const item of items) {
      const inventoryRef = doc(db, "inventory", item.chainId);

      const currentChain = inventory.find(
        inv => inv.id === item.chainId
      );

      const newWeight =
        Number(currentChain.weight) - Number(item.soldWeight);

      await updateDoc(inventoryRef, {
        weight: newWeight,
      });
    }

    /* ================= BILL SAVE ================= */
    await addDoc(collection(db, "bills"), {
      customerId,
      customerName,
      items,
      previousDue,
      goldReceived: Number(goldReceived || 0),
      totalFine,
      finalDue: finalBalance,
      createdAt: serverTimestamp(),
    });

    alert("✅ Bill saved & Stock Updated");

    /* ================= RESET ================= */
    setItems([]);
    setGoldReceived("");

    /* 🔥 Refresh Inventory So Updated Weight Shows */
    const snap = await getDocs(collection(db, "inventory"));
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(
        item =>
          item.chainType !== "Pure" &&
          item.name !== "Pure Gold"
      );
    setInventory(data);

    return true;

  } catch (err) {
    console.error(err);
    alert("❌ Error saving bill");
    return false;
  } finally {
    setLoading(false);
  }
};

  /* ================= UI ================= */
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border text-gray-800">
      <h3 className="text-xl font-semibold mb-6">
        Jewellery Billing
      </h3>

      {/* Customer */}
      <input
        className="w-full border rounded-lg p-3 text-black"
        placeholder="Customer Name"
        value={customerName}
        onChange={e => setCustomerName(e.target.value)}
      />

      {/* Due Info */}
      <div className="mt-4 bg-gray-50 p-4 rounded-lg text-sm">
        <p>
          Due Access:{" "}
          <b
            className={
              allowDue
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {allowDue ? "Allowed" : "Blocked"}
          </b>
        </p>

        <p className="mt-1">
          Previous Due:{" "}
          <b>{previousDue.toFixed(3)} g</b>
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
          className="bg-black text-white rounded-lg"
        >
          + Add
        </button>

        
      </div>
{items.length > 0 && (
  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
    <h4 className="font-semibold mb-3">Added Chains</h4>

    {items.map((item, index) => (
      <div
        key={index}
        className="flex justify-between items-center border-b py-3 text-sm"
      >
        <div>
          <p className="font-medium">
            {item.chainName} ({item.carat}K)
          </p>
          <p className="text-gray-600">
            Sold: {item.soldWeight}g
          </p>
          <p className="text-gray-600">
            Fine: {item.fineMetal}g
          </p>
        </div>

        <button
          onClick={() =>
            setItems(prev =>
              prev.filter((_, i) => i !== index)
            )
          }
          className="text-red-500 text-xs font-semibold"
        >
          Remove
        </button>
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

        <p className="mt-3 font-semibold">
          Final Balance: {finalBalance.toFixed(3)} g
        </p>
      </div>

      {/* Save */}
    {/* ================= ACTION BUTTONS ================= */}
<div className="flex gap-4 mt-6">
  {/* SAVE ONLY */}
  <button
    onClick={saveBill}
    disabled={loading}
    className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold"
  >
    {loading ? "Saving..." : "Save Bill"}
  </button>

  {/* SAVE + PRINT */}
 <button
  onClick={async () => {
    const saved = await saveBill();
    if (saved) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }}
  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-semibold"
>
  Save & Print
</button>


</div>
{/* ================= PRINT SECTION ================= */}
<div
  id="print-section"
  className="hidden print:block bg-white text-black"
>
  <div className="max-w-3xl mx-auto">

    <h1 className="text-2xl font-bold text-center mb-2">
      Your Jewellery Shop Name
    </h1>

    <p className="text-center text-sm mb-6">
      Mobile: 9876543210
    </p>

    <div className="flex justify-between mb-4 text-sm">
      <p><strong>Customer:</strong> {customerName}</p>
      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
    </div>

    <table className="w-full border border-black text-sm">
      <thead>
        <tr className="border-b border-black">
          <th className="p-2 border-r border-black text-left">Item</th>
          <th className="p-2 border-r border-black text-center">Carat</th>
          <th className="p-2 border-r border-black text-center">Weight</th>
          <th className="p-2 text-center">Fine</th>
        </tr>
      </thead>

      <tbody>
        {items.map((item, index) => (
          <tr key={index} className="border-b border-black">
            <td className="p-2 border-r border-black">
              {item.chainName}
            </td>
            <td className="p-2 border-r border-black text-center">
              {item.carat}K
            </td>
            <td className="p-2 border-r border-black text-center">
              {item.soldWeight}g
            </td>
            <td className="p-2 text-center">
              {item.fineMetal}g
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="mt-6 text-right text-sm space-y-1">
      <p><strong>Previous Due:</strong> {previousDue.toFixed(3)} g</p>
      <p><strong>Total Fine:</strong> {totalFine.toFixed(3)} g</p>
      <p><strong>Gold Received:</strong> {Number(goldReceived || 0).toFixed(3)} g</p>

      <p className="text-lg font-bold mt-2">
        Final Balance: {(previousDue + totalFine - Number(goldReceived || 0)).toFixed(3)} g
      </p>
    </div>

    <div className="mt-10 text-center text-sm">
      Thank you for your business 🙏
    </div>
  </div>
</div>

    </div>
  );
}
