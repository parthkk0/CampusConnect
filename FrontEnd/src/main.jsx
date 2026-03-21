import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Graceful fallback for local development when Clerk key is not set
const clerkEnabled = Boolean(PUBLISHABLE_KEY && PUBLISHABLE_KEY !== "pk_test_placeholder");

const Root = () => {
  if (clerkEnabled) {
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    );
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

