export default function Topbar() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Analytics</h2>

      <div className="flex items-center gap-3">
        <input
          placeholder="Search here"
          className="border rounded px-3 py-1 text-sm"
        />
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}
