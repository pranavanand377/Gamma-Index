import { useState } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import MyList from './pages/MyList';
import FilteredPage from './pages/FilteredPage';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-surface-base">
        {/* Navbar */}
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Main area: Sidebar + Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/my-list" element={<MyList />} />
                <Route path="/library/:filter" element={<FilteredPage mode="library" />} />
                <Route path="/status/:filter" element={<FilteredPage mode="status" />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
