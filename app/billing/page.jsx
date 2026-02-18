"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BillingForm from "../components/BillingForm";
import BillingSummary from "../components/BillingSummary";
import PastInvoices from "../components/PastInvoices";

export default function BillingPage() {
  const [totalFine, setTotalFine] = useState(0);
  const [goldReceived, setGoldReceived] = useState(0);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <Topbar />

        <div className="grid grid-cols-12 gap-6 mt-6">
          
          {/* LEFT SIDE */}
          <div className="col-span-8">
            <BillingForm
              setTotalFine={setTotalFine}
              setGoldReceived={setGoldReceived}
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="col-span-4 space-y-6">
            <BillingSummary
              totalFine={totalFine}
              goldReceived={goldReceived}
            />

            <PastInvoices />
          </div>

        </div>
      </main>
    </div>
  );
}
