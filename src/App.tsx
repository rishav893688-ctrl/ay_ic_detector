import { useState } from 'react';
import { Cpu, Users, Eye, Settings, Menu, X } from 'lucide-react';
import { OperatorPage } from './components/OperatorPage';
import { AdminPage } from './components/AdminPage';
import { ReviewPage } from './components/ReviewPage';
import { SettingsPage } from './components/SettingsPage';

type PageType = 'operator' | 'admin' | 'review' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('operator');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pages = [
    { id: 'operator' as PageType, name: 'Operator', icon: Cpu, description: 'Upload and inspect IC markings' },
    { id: 'admin' as PageType, name: 'Admin', icon: Users, description: 'Manage datasheet library' },
    { id: 'review' as PageType, name: 'Review', icon: Eye, description: 'Review suspicious detections' },
    { id: 'settings' as PageType, name: 'Settings', icon: Settings, description: 'Configure system' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'operator':
        return <OperatorPage />;
      case 'admin':
        return <AdminPage />;
      case 'review':
        return <ReviewPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OperatorPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-slate-900 text-white flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">AOI System</h1>
              <p className="text-xs text-slate-400">IC Marking Verification</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {pages.map((page) => {
              const Icon = page.icon;
              const isActive = currentPage === page.id;
              return (
                <li key={page.id}>
                  <button
                    onClick={() => setCurrentPage(page.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs opacity-75">{page.description}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            <div className="mb-1">System Status: <span className="text-green-400 font-medium">Online</span></div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
            </button>
            <div className="text-right">
              <div className="text-sm text-slate-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
