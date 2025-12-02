import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./routes/App.jsx";
import Chat from "./routes/Chat.jsx";
import Docs from "./routes/Docs.jsx";
import Wissen from "./routes/Wissen.jsx";
import AuthTest from "./routes/AuthTest.jsx";      // Testseite lassen wir vorerst drin
import Login from "./routes/Login.jsx";           // NEU

import { AuthProvider } from "./AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx"; // NEU

const router = createBrowserRouter([
  { path: "/", element: <App /> },

  // öffentlicher Login
  { path: "/login", element: <Login /> },

  // Testseite (kannst du später löschen)
  { path: "/auth-test", element: <AuthTest /> },

  // geschützte Routen
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    )
  },
  {
    path: "/dokumente",
    element: (
      <ProtectedRoute>
        <Docs />
      </ProtectedRoute>
    )
  },
  {
    path: "/wissen",
    element: (
      <ProtectedRoute>
        <Wissen />
      </ProtectedRoute>
    )
  }
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
