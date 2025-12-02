import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./routes/App.jsx";
import Chat from "./routes/Chat.jsx";
import Docs from "./routes/Docs.jsx";
import Wissen from "./routes/Wissen.jsx";
import Login from "./routes/Login.jsx";
import AuthTest from "./routes/AuthTest.jsx"; // kannst du später löschen

import { AuthProvider } from "./AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const router = createBrowserRouter([
  // Mainseite: App, aber geschützt
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },

  // Öffentliche Login-Seite
  { path: "/login", element: <Login /> },

  // Testseite (optional)
  { path: "/auth-test", element: <AuthTest /> },

  // geschützte Unterseiten
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dokumente",
    element: (
      <ProtectedRoute>
        <Docs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wissen",
    element: (
      <ProtectedRoute>
        <Wissen />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
