export default function StatCard({ title, value, change, color }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div
        className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-white`}
        style={{ backgroundColor: color }}
      >
        ●
      </div>

      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
      <p className="text-green-500 text-xs">{change}</p>
    </div>
  );
}
