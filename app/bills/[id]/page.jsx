"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import DashboardLayout from "../../components/DashboardLayout";

export default function BillViewPage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const printRef = useRef();

  /* ================= FETCH BILL ================= */
  useEffect(() => {
    const fetchBill = async () => {
      const snap = await getDoc(doc(db, "bills", id));
      if (snap.exists()) {
        setBill({ id: snap.id, ...snap.data() });
      }
    };
    fetchBill();
  }, [id]);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Bill Print</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1,h2,h3 { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  if (!bill) {
    return (
      <DashboardLayout>
        <p className="text-black">Loading bill...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* ACTIONS */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="bg-black text-white px-4 py-2 rounded"
        >
          🖨 Print Bill
        </button>
      </div>

      {/* BILL CONTENT */}
      <div
        ref={printRef}
        className="bg-white p-6 rounded-xl shadow text-black"
      >
        <h1 className="text-xl font-bold text-center">
          JEWELLERY BILL
        </h1>

        <hr className="my-2" />

        <p>
          <b>Customer:</b> {bill.customerName}
        </p>
        <p>
          <b>Date:</b>{" "}
          {bill.createdAt
            ? new Date(
                bill.createdAt.seconds * 1000
              ).toLocaleString()
            : "-"}
        </p>

        <hr className="my-2" />

        {/* ITEMS */}
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Carat</th>
              <th>Weight (g)</th>
              <th>Fine Gold (g)</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((i, idx) => (
              <tr key={idx}>
                <td>{i.chainName}</td>
                <td>{i.carat}K</td>
                <td>{i.soldWeight}</td>
                <td>{i.fineMetal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="my-2" />

        {/* SUMMARY */}
        <p>
          <b>Previous Due:</b>{" "}
          {Number(bill.previousDue || 0).toFixed(3)} g
        </p>
        <p>
          <b>Total Fine:</b>{" "}
          {Number(bill.totalFine || 0).toFixed(3)} g
        </p>
        <p>
          <b>Gold Received:</b>{" "}
          {Number(bill.goldReceived || 0).toFixed(3)} g
        </p>

        <h3 className="mt-2 text-lg">
          <b>Final Due:</b>{" "}
          <span
            style={{
              color:
                bill.finalDue > 0 ? "red" : "green",
            }}
          >
            {Number(bill.finalDue || 0).toFixed(3)} g
          </span>
        </h3>

        <hr className="my-2" />

        <p className="text-center">
          Thank You 🙏
        </p>
      </div>
    </DashboardLayout>
  );
}
