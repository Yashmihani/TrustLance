// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider }        from './context/WalletContext';
import { AuthProvider }          from './context/AuthContext';
import { NotificationProvider }  from './context/NotificationContext';
import Layout                    from './components/layout/Layout';
import ProtectedRoute            from './components/common/ProtectedRoute';

import Home               from './pages/Home';
import Explore            from './pages/Explore';
import Dashboard          from './pages/Dashboard';
import ProjectDetail      from './pages/ProjectDetail';
import ConnectWallet      from './pages/ConnectWallet';
import ProfileSetup       from './pages/ProfileSetup';
import EditProfile        from './pages/EditProfile';
import FreelancerProfile  from './pages/FreelancerProfile';
import PostJob            from './pages/PostJob';
import EscrowPage         from './pages/EscrowPage';
import Transactions       from './pages/Transactions';
import Notifications      from './pages/Notifications';
import NotFound           from './pages/NotFound';

function App() {
  return (
    <WalletProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/"                       element={<Home />} />
                <Route path="/explore"                element={<Explore />} />
                <Route path="/connect"                element={<ConnectWallet />} />
                <Route path="/projects/:id"           element={<ProjectDetail />} />
                <Route path="/profile/:walletAddress" element={<FreelancerProfile />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                }/>
                <Route path="/post-job" element={
                  <ProtectedRoute><PostJob /></ProtectedRoute>
                }/>
                <Route path="/profile/setup" element={
                  <ProtectedRoute><ProfileSetup /></ProtectedRoute>
                }/>
                <Route path="/profile/edit" element={
                  <ProtectedRoute><EditProfile /></ProtectedRoute>
                }/>
                <Route path="/escrow/:projectId" element={
                  <ProtectedRoute><EscrowPage /></ProtectedRoute>
                }/>
                <Route path="/transactions" element={
                  <ProtectedRoute><Transactions /></ProtectedRoute>
                }/>
                <Route path="/notifications" element={
                  <ProtectedRoute><Notifications /></ProtectedRoute>
                }/>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </WalletProvider>
  );
}

export default App;