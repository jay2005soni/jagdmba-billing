export default function BillingSummary({ totalFine, goldReceived }) {
  const final = totalFine - Number(goldReceived || 0);

  return (
    <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white rounded-2xl p-8 shadow-xl">
      <h3 className="text-lg font-semibold mb-6">
        Billing Summary
      </h3>

      <div className="space-y-6">
        <div>
          <p className="text-sm opacity-80">Fine Total</p>
          <p className="text-3xl font-bold">
            {totalFine.toFixed(3)} g
          </p>
        </div>

        <div>
          <p className="text-sm opacity-80">
            Gold Received
          </p>
          <p className="text-2xl font-semibold">
            {goldReceived || 0} g
          </p>
        </div>

        <div className="border-t border-white/30 pt-4">
          <p className="text-sm opacity-80">
            Final Balance
          </p>
          <p className="text-2xl font-bold">
            {final.toFixed(3)} g
          </p>
        </div>
      </div>
    </div>
  );
}
