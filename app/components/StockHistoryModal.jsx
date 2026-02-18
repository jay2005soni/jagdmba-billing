"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function StockHistoryModal({ close }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(
        collection(db, "stockHistory"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setHistory(data);
    };

    fetchHistory();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[700px] max-h-[80vh] overflow-y-auto">
        <h3 className="font-semibold mb-4 text-black text-lg">
          Stock Update History
        </h3>

        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-2">Item</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Weight</th>
              <th>New Total</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No history found
                </td>
              </tr>
            )}

            {history.map((h) => {
              const dateObj = h.createdAt?.toDate?.();
              const date = dateObj
                ? dateObj.toLocaleDateString()
                : "-";
              const time = dateObj
                ? dateObj.toLocaleTimeString()
                : "-";

              return (
                <tr key={h.id} className="border-t text-black">
                  <td className="p-2">{h.itemName}</td>
                  <td>{date}</td>
                  <td>{time}</td>
                  <td
                    className={
                      h.type === "ADD"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {h.type}
                  </td>
                  <td>
                    {h.addedWeight || h.deductedWeight} g
                  </td>
                  <td>{h.newTotal} g</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          onClick={close}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
