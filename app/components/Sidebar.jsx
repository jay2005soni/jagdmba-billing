export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#1f1f1f] text-white min-h-screen p-4">
      <h1 className="text-lg font-bold mb-6">Material Dashboard 2 PRO</h1>

      <nav className="space-y-2 text-sm">
        <p className="text-gray-400 uppercase text-xs mt-4">Dashboards</p>

        <div className="bg-pink-600 rounded px-3 py-2">Analytics</div>
        <div className="px-3 py-2 hover:bg-gray-800 rounded">Billing</div>
        <div className="px-3 py-2 hover:bg-gray-800 rounded">Stock Maintain</div>
        <div className="px-3 py-2 hover:bg-gray-800 rounded">Alerts</div>
          <div className="px-3 py-2 hover:bg-gray-800 rounded">Customer</div>

        <p className="text-gray-400 uppercase text-xs mt-6">Account</p>
        <div className="px-3 py-2 hover:bg-gray-800 rounded">Settings</div>
        <div className="px-3 py-2 hover:bg-gray-800 rounded">Profile</div>
      </nav>
    </aside>
  );
}
