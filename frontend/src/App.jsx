import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApplicationProvider } from './context/ApplicationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Services from './pages/Services';
import AgentWorkspace from './pages/AgentWorkspace';
import Documents from './pages/Documents';
import ApplicationReview from './pages/ApplicationReview';
import Consent from './pages/Consent';
import GovernmentPortal from './pages/GovernmentPortal';
import ApplicationStatus from './pages/ApplicationStatus';
import AuditLog from './pages/AuditLog';

function App() {
  return (
    <ApplicationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/agent" element={<AgentWorkspace />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/review" element={<ApplicationReview />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/portal" element={<GovernmentPortal />} />
            <Route path="/status" element={<ApplicationStatus />} />
            <Route path="/audit" element={<AuditLog />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ApplicationProvider>
  );
}

export default App;
