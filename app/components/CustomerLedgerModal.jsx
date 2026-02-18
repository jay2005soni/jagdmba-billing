"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function CustomerLedgerModal({ customer, close }) {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      const q = query(
        collection(db, "bills"),
        where("customerName", "==", customer.name),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      setBills(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    fetchBills();
  }, [customer]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[600px] p-5 rounded-lg">
        <h3 className="font-bold text-lg text-black mb-3">
          Ledger – {customer.name}
        </h3>

        {bills.length === 0 && (
          <p className="text-gray-500">No transactions found</p>
        )}

        {bills.map(b => (
          <div
            key={b.id}
            className="border rounded p-3 mb-2 text-sm text-black"
          >
            <p>
              <b>Date:</b>{" "}
              {b.createdAt?.toDate().toLocaleString()}
            </p>
            <p>
              <b>Fine:</b> {b.totalFine} g
            </p>
            <p>
              <b>Gold Received:</b> {b.goldReceived} g
            </p>
            <p>
              <b>Final Due:</b> {b.finalDue} g
            </p>
          </div>
        ))}

        <button
          onClick={close}
          className="mt-3 bg-black text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
