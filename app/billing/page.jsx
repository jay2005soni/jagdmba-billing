"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BillingForm from "../components/BillingForm";
import BillingSummary from "../components/BillingSummary";
import PastInvoices from "../components/PastInvoices";

export default function BillingPage() {
  const [billingData, setBillingData] = useState({
    totalFine: 0,
    goldReceived: 0,
    previousDue: 0,
  });

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <Topbar />

        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-8">
            <BillingForm setBillingData={setBillingData} />
          </div>

          <div className="col-span-4 space-y-6">
            <BillingSummary billingData={billingData} />
            <PastInvoices />
          </div>
        </div>
      </main>
    </div>
  );
}
