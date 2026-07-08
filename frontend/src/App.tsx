import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkflowBuilder from './features/workflows/WorkflowBuilder';
import Login from './pages/Login';
import Register from './pages/Register';
import Workspaces from './pages/Workspaces';
import WorkspaceSettings from './pages/WorkspaceSettings';
import Executions from './pages/Executions';
import DataStore from './pages/DataStore';
import Help from './pages/Help';
import ProfileSettings from './pages/ProfileSettings';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<ProtectedRoute />}>
        {/* Standard pages with Navbar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workspaces" element={<Workspaces />} />
          <Route path="settings/workspace" element={<WorkspaceSettings />} />
          <Route path="settings/profile" element={<ProfileSettings />} />
          <Route path="datastore" element={<DataStore />} />
          <Route path="executions" element={<Executions />} />
          <Route path="help" element={<Help />} />
        </Route>

        {/* Full-screen Canvas Editor without Navbar */}
        <Route path="workflows/new" element={<WorkflowBuilder />} />
        <Route path="workflows/:id/edit" element={<WorkflowBuilder />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
