import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { PlatformProvider } from "./context/PlatformContext";

const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const MapPage = lazy(() => import("./pages/MapPage").then((module) => ({ default: module.MapPage })));
const JobsPage = lazy(() => import("./pages/JobsPage").then((module) => ({ default: module.JobsPage })));
const ProfileChoicePage = lazy(() =>
  import("./pages/ProfileChoicePage").then((module) => ({ default: module.ProfileChoicePage })),
);
const PlansPage = lazy(() => import("./pages/PlansPage").then((module) => ({ default: module.PlansPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((module) => ({ default: module.ContactPage })),
);
const LoginCandidatePage = lazy(() =>
  import("./pages/LoginCandidatePage").then((module) => ({ default: module.LoginCandidatePage })),
);
const LoginCompanyPage = lazy(() =>
  import("./pages/LoginCompanyPage").then((module) => ({ default: module.LoginCompanyPage })),
);
const RegisterCandidatePage = lazy(() =>
  import("./pages/RegisterCandidatePage").then((module) => ({ default: module.RegisterCandidatePage })),
);
const RegisterCompanyPage = lazy(() =>
  import("./pages/RegisterCompanyPage").then((module) => ({ default: module.RegisterCompanyPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPasswordPage").then((module) => ({ default: module.ForgotPasswordPage })),
);
const CompanyProfilePage = lazy(() =>
  import("./pages/CompanyProfilePage").then((module) => ({ default: module.CompanyProfilePage })),
);
const CandidateWorkspacePage = lazy(() =>
  import("./pages/CandidateWorkspacePage").then((module) => ({ default: module.CandidateWorkspacePage })),
);
const CompanyWorkspacePage = lazy(() =>
  import("./pages/CompanyWorkspacePage").then((module) => ({ default: module.CompanyWorkspacePage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="route-loading">Carregando experiencia...</div>}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/vagas" element={<JobsPage />} />
            <Route path="/perfil" element={<ProfileChoicePage />} />
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/login/candidato" element={<LoginCandidatePage />} />
            <Route path="/login/empresa" element={<LoginCompanyPage />} />
            <Route path="/cadastro/candidato" element={<RegisterCandidatePage />} />
            <Route path="/cadastro/empresa" element={<RegisterCompanyPage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="/empresa/:slug" element={<CompanyProfilePage />} />
            <Route
              path="/app/candidato"
              element={
                <ProtectedRoute allowedType="candidate">
                  <CandidateWorkspacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/empresa"
              element={
                <ProtectedRoute allowedType="company">
                  <CompanyWorkspacePage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PlatformProvider>
    </AuthProvider>
  );
}
