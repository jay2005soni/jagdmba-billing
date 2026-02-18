"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import DashboardLayout from "../../components/DashboardLayout";

export default function CustomerProfilePage() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH CUSTOMER ================= */
  useEffect(() => {
    const fetchCustomer = async () => {
      const snap = await getDoc(doc(db, "customers", id));
      if (snap.exists()) {
        setCustomer({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };

    fetchCustomer();
  }, [id]);

  /* ================= FETCH BILLS (OLD + NEW) ================= */
  useEffect(() => {
    if (!customer) return;

    const fetchBills = async () => {
      let billsData = [];

      // 🔹 NEW bills (customerId based)
      const q1 = query(
        collection(db, "bills"),
        where("customerId", "==", customer.id)
      );
      const snap1 = await getDocs(q1);
      snap1.docs.forEach(d =>
        billsData.push({ id: d.id, ...d.data() })
      );

      // 🔹 OLD bills (customerName based)
      const q2 = query(
        collection(db, "bills"),
        where("customerName", "==", customer.name)
      );
      const snap2 = await getDocs(q2);
      snap2.docs.forEach(d => {
        if (!billsData.find(b => b.id === d.id)) {
          billsData.push({ id: d.id, ...d.data() });
        }
      });

      // sort latest first
      billsData.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      );

      setBills(billsData);
    };

    fetchBills();
  }, [customer]);

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-black">Loading profile...</p>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <p className="text-red-600">
          Customer not found
        </p>
      </DashboardLayout>
    );
  }

  const visibleBills = showAll ? bills : bills.slice(0, 5);

  return (
    <DashboardLayout>
      {/* ================= PROFILE ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold text-black">
          {customer.name}
        </h2>

        <p className="text-black mt-1">
          📞 Mobile:{" "}
          <b>{customer.mobile || "-"}</b>
        </p>

        <p className="mt-3 text-lg">
          TOTAL DUE:{" "}
          <span
            className={`text-2xl font-bold ${
              customer.totalDue > 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {Number(customer.totalDue || 0).toFixed(3)} g
          </span>
        </p>

        <p className="mt-1">
          Due Access:{" "}
          <b
            className={
              customer.allowDue
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {customer.allowDue ? "Allowed" : "Blocked"}
          </b>
        </p>
      </div>

      {/* ================= TRANSACTIONS ================= */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <h3 className="font-semibold text-black">
            Transactions
          </h3>

          {bills.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600"
            >
              {showAll
                ? "Show Recent"
                : "View All Transactions"}
            </button>
          )}
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-black">
            <tr>
  <th className="p-3 text-left">Date</th>
  <th>Fine Gold (g)</th>
  <th>Gold Received (g)</th>
  <th>Final Due (g)</th>
  <th>Bill</th> {/* 🔥 NEW */}
</tr>

          </thead>

          <tbody>
            {visibleBills.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-4 text-center text-gray-500"
                >
                  No transactions found
                </td>
              </tr>
            )}

            {visibleBills.map(b => (
              <tr
                key={b.id}
                className="border-t text-center"
              >
                <td className="p-3 text-left text-black">
                  {b.createdAt
                    ? new Date(
                        b.createdAt.seconds * 1000
                      ).toLocaleDateString()
                    : "-"}
                </td>

                <td className="text-black">
                  {Number(b.totalFine || 0).toFixed(3)}
                </td>

                <td className="text-black">
                  {Number(b.goldReceived || 0).toFixed(3)}
                </td>

                <td
                  className={`font-semibold ${
                    b.finalDue > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {Number(b.finalDue || 0).toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
