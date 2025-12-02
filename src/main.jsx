import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import AuthTest from "./routes/AuthTest.jsx";
import App from "./routes/App.jsx";
import Chat from "./routes/Chat.jsx";
import Docs from "./routes/Docs.jsx";
import Wissen from "./routes/Wissen.jsx";

import { AuthProvider } from "./AuthContext.jsx";  // ⬅️ Neu

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/chat", element: <Chat /> },
  { path: "/dokumente", element: <Docs /> },
  { path: "/wissen", element: <Wissen /> },
  { path: "/auth-test", element: <AuthTest /> }  // neu
]);


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>               {/* ⬅️ Neu */}
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
