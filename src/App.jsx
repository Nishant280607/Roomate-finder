import { createBrowserRouter, Link, Outlet, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import { ToastProvider } from "./context/ToastContext";
import { AppGate, AppShell, PublicOnly, RequireAuth } from "./components/Shell";
import { BrandMark } from "./components/Bits";
import Landing from "./pages/Landing";
import { AuthCallback, Login, ResetPassword, Signup } from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Person from "./pages/Person";
import Connections from "./pages/Connections";
import Messages from "./pages/Messages";
import Saved from "./pages/Saved";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function Providers() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ToastProvider>
  );
}

function SignedIn() {
  return (
    <RequireAuth>
      <StoreProvider>
        <AppGate>
          <Outlet />
        </AppGate>
      </StoreProvider>
    </RequireAuth>
  );
}

function NotFound() {
  return (
    <div className="splash">
      <BrandMark size={44} />
      <h1 className="h-page">Wrong door</h1>
      <p className="muted">There's nothing at this address.</p>
      <Link to="/" className="btn btn-primary">
        Go to the start
      </Link>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Providers />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/login", element: <PublicOnly><Login /></PublicOnly> },
      { path: "/signup", element: <PublicOnly><Signup /></PublicOnly> },
      { path: "/auth/callback", element: <AuthCallback /> },
      { path: "/reset-password", element: <ResetPassword /> },
      {
        element: <SignedIn />,
        children: [
          { path: "/welcome", element: <Onboarding /> },
          {
            element: <AppShell />,
            children: [
              { path: "/home", element: <Home /> },
              { path: "/discover", element: <Discover /> },
              { path: "/people/:id", element: <Person /> },
              { path: "/connections", element: <Connections /> },
              { path: "/messages", element: <Messages /> },
              { path: "/messages/:id", element: <Messages /> },
              { path: "/saved", element: <Saved /> },
              { path: "/activity", element: <Activity /> },
              { path: "/profile", element: <Profile /> },
              { path: "/settings", element: <Settings /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
