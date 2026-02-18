export default function ChartCard({ title, bg }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className={`h-40 ${bg}`} />
      <div className="p-4">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-xs text-gray-500">Last campaign performance</p>
      </div>
    </div>
  );
}
