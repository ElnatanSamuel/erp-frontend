import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import DashboardLoader from '../components/dashboard/DashboardLoader';

export default function HomePage() {
  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <Header />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <DashboardLoader />

          
        </div>
      </div>
    </div>
  );
}
