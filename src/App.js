import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

import Login from "./login";
import Dashboard from "./dashboard";

// Pages
import Indent from "./pages/Indent";
import AssetDetails from "./pages/AssetDetails";
import ScrapItems from "./pages/ScrapItems";
import StockItems from "./pages/StockItems";
import AssetSummary from "./pages/AssetSummary";
import EmailManager from "./pages/EmailManager";
import InvoiceManager from "./pages/InvoiceManager";
import EmailSummary from "./pages/EmailSummary";
import CostManager from "./pages/CostManager";
import CostSummary from "./pages/CostSummary";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Handle OTP redirect + Google redirect + existing sessions
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        setUser(data.session.user);
      }

      setLoading(false);
    };

    checkSession();

    // Listen for login/logout events
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* LOGIN PAGE */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* DASHBOARD (Protected) */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard setUser={setUser} /> : <Navigate to="/" />}
        />

        {/* PROTECTED ROUTES */}
        <Route path="/indent" element={user ? <Indent /> : <Navigate to="/" />} />
        <Route path="/invoice-manager" element={user ? <InvoiceManager /> : <Navigate to="/" />} />
        <Route path="/email-manager" element={user ? <EmailManager /> : <Navigate to="/" />} />
        <Route path="/emailsummary" element={user ? <EmailSummary /> : <Navigate to="/" />} />

        {/* Asset Modules */}
        <Route path="/asset-details" element={user ? <AssetDetails /> : <Navigate to="/" />} />
        <Route path="/scrap-items" element={user ? <ScrapItems /> : <Navigate to="/" />} />
        <Route path="/stock-items" element={user ? <StockItems /> : <Navigate to="/" />} />
        <Route path="/asset-summary" element={user ? <AssetSummary /> : <Navigate to="/" />} />
        <Route path="/cost-manager" element={user ? <CostManager /> : <Navigate to="/" />} />
        <Route path="/cost-summary" element={user ? <CostSummary /> : <Navigate to="/" />} />

        {/* Otherwise redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
