import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import SalesTable from "../components/SalesTable";

export default function DashboardPage() {
  return (
    <div className="flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <Topbar />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard title="Gold" value="281g" change="+55% than last week" color="#111" />
          <StatCard title="Silver" value="2,300g" change="+3%" color="#ec407a" />
          <StatCard title="Revenue" value="34k" change="+1%" color="#66bb6a" />
          <StatCard title="Customers" value="+91" change="Just updated" color="#42a5f5" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <ChartCard title="Last Month Sale" bg="bg-pink-500" />
          <ChartCard title="Daily Sales" bg="bg-green-500" />
          <ChartCard title="Completed Tasks" bg="bg-gray-800" />
        </div>

        <SalesTable />
      </main>
    </div>
  );
}
