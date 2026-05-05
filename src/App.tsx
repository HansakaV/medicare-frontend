import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { MainLayout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

import { Patients } from './pages/Patients';

import { Queue } from './pages/Queue';

import { Inventory } from './pages/Inventory';

import { Billing } from './pages/Billing';

import { SMS } from './pages/SMS';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>

        <Route path="/login" element={<Login />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="patients" element={<Patients />} />
                <Route path="queue" element={<Queue />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="billing" element={<Billing />} />
                <Route path="sms" element={<SMS />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
