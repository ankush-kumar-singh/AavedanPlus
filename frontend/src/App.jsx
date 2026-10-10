import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApplicationProvider } from './context/ApplicationContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Services from './pages/Services';
import AgentWorkspace from './pages/AgentWorkspace';
import ApplicationStatus from './pages/ApplicationStatus';
import AuditLog from './pages/AuditLog';
import { useAuth } from './context/useAuth';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <ApplicationProvider key={user?.id || 'anonymous'}>
        <Routes>
          {/* Public — Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected — login ke baad hi */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/agent" element={<AgentWorkspace />} />
            <Route path="/services" element={<Services />} />
            <Route path="/documents" element={<Navigate to="/agent" replace />} />
            <Route path="/review" element={<Navigate to="/agent" replace />} />
            <Route path="/consent" element={<Navigate to="/agent" replace />} />
            <Route path="/portal" element={<Navigate to="/agent" replace />} />
            <Route path="/status" element={<ApplicationStatus />} />
            <Route path="/audit" element={<AuditLog />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? '/agent' : '/login'} replace />} />
        </Routes>
      </ApplicationProvider>
    </BrowserRouter>
  );
}

export default App;
