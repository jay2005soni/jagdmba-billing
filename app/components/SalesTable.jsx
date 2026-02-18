export default function SalesTable() {
  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6">
      <h3 className="font-semibold mb-4">Top Selling Products</h3>

      <table className="w-full text-sm">
        <thead className="text-gray-400">
          <tr>
            <th align="left">Product</th>
            <th>Value</th>
            <th>Ads Spent</th>
            <th>Refunds</th>
          </tr>
        </thead>

        <tbody>
          {[
            ["Gold Ring", "$130,992", "$9,500", "13"],
            ["Diamond Chain", "$80,250", "$4,200", "40"],
            ["Silver Bangles", "$40,600", "$9,430", "54"],
          ].map((row, i) => (
            <tr key={i} className="border-t">
              {row.map((cell, j) => (
                <td key={j} className="py-2 text-center">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
