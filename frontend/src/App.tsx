import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ProjectsPage from "./pages/Project/ProjectsPage";
import ProjectDetailPage from "./pages/Project/ProjectDetailPage";
import WorkspaceIndex from "./pages/Project/WorkspaceIndex";
import FullPageLoader from "./components/FullPageLoader";

const ChapterPage = lazy(() => import("./pages/Project/ChapterPage"));

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkspaceIndex />} />
        <Route
          path="chapters/:chapterId"
          element={
            <Suspense
              fallback={<FullPageLoader label="Unrolling the parchment…" />}
            >
              <ChapterPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default App;
