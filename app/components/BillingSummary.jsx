export default function BillingSummary({ billingData }) {
  const { totalFine, goldReceived, previousDue } = billingData;

  const finalBalance =
    previousDue + totalFine - goldReceived;

  const isDue = finalBalance > 0;
  const isAdvance = finalBalance < 0;

  return (
    <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white rounded-2xl p-8 shadow-xl">
      <h3 className="text-lg font-semibold mb-6">
        Billing Summary
      </h3>

      <div className="space-y-6">

        {/* Previous Due */}
        <div>
          <p className="text-sm opacity-80">
            Previous Due
          </p>
          <p className="text-2xl font-bold">
            {previousDue.toFixed(3)} g
          </p>
        </div>

        {/* Fine Total */}
        <div>
          <p className="text-sm opacity-80">
            Fine Total
          </p>
          <p className="text-2xl font-bold">
            {totalFine.toFixed(3)} g
          </p>
        </div>

        {/* Gold Received */}
        <div>
          <p className="text-sm opacity-80">
            Gold Received
          </p>
          <p className="text-2xl font-bold">
            {goldReceived.toFixed(3)} g
          </p>
        </div>

        {/* Final Balance */}
        <div className="border-t border-white/30 pt-5">
          <p className="text-sm opacity-80">
            Final Balance
          </p>

          <p
            className={`text-3xl font-bold mt-2 ${
              isDue
                ? "text-red-200"
                : isAdvance
                ? "text-green-200"
                : "text-white"
            }`}
          >
            {finalBalance.toFixed(3)} g
          </p>

          {isDue && (
            <p className="text-red-200 text-sm mt-2">
              🔴 Customer Due
            </p>
          )}

          {isAdvance && (
            <p className="text-green-200 text-sm mt-2">
              🟢 Advance Balance
            </p>
          )}

          {!isDue && !isAdvance && (
            <p className="text-white text-sm mt-2">
              ✅ Fully Settled
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
