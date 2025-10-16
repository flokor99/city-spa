import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./routes/App.jsx";
import Chat from "./routes/Chat.jsx";
import Docs from "./routes/Docs.jsx";
import Wissen from "./routes/Wissen.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/chat", element: <Chat /> },
  { path: "/dokumente", element: <Docs /> },
  { path: "/wissen", element: <Wissen /> }
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
