import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import DocsPage from './pages/DocsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

const ProtectedRoute = ({ children }) => {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
};

const AuthRoute = ({ children }) => {
  const { session } = useAuth();
  if (session) {
    return <Navigate to="/app" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        
        {/* Auth routes */}
        <Route path="sign-in/*" element={<AuthRoute><SignInPage /></AuthRoute>} />
        <Route path="sign-up/*" element={<AuthRoute><SignUpPage /></AuthRoute>} />

        {/* Protected Dashboard Route */}
        <Route path="app" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Static Pages */}
        <Route path="pricing" element={<PricingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="docs" element={<DocsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
