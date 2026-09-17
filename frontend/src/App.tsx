import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrototypeProvider } from './context/PrototypeContext';
import { AppShell } from './components/layout/AppShell';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ArtifactsPage } from './pages/ArtifactsPage';
import { ArtifactDetailPage } from './pages/ArtifactDetailPage';
import { UserManagementPage } from './pages/UserManagementPage';

export function App() {
  return (
    <PrototypeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="artifacts" element={<ArtifactsPage />} />
            <Route path="artifacts/:id" element={<ArtifactDetailPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PrototypeProvider>
  );
}

export default App;
