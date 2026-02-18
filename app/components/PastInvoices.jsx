import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function PastInvoices() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      const snap = await getDocs(collection(db, "bills"));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setBills(data.slice(-5).reverse());
    };

    fetchBills();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow border">
      <h3 className="font-semibold mb-4">
        Past Invoices
      </h3>

      <div className="space-y-4">
        {bills.map(b => (
          <div
            key={b.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p className="text-sm font-medium">
                {b.customerName}
              </p>
              <p className="text-xs text-gray-500">
                {b.totalFine?.toFixed(3)} g
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="text-sm text-pink-600 font-semibold"
            >
              PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
