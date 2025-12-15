// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Auth & Dashboard
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
import Renewal from "./pages/Renewal";
import UserAllotments from "./pages/UserAllotments"; // ✅ Add this impor

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check Supabase session on mount & listen for auth changes
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) setUser(data.session.user);
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* LOGIN PAGE */}
        <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />

        {/* DASHBOARD (Protected) */}
        <Route path="/dashboard" element={user ? <Dashboard setUser={setUser} /> : <Navigate to="/" replace />} />

        {/* PROTECTED ROUTES */}
        <Route path="/indent" element={user ? <Indent /> : <Navigate to="/" replace />} />
        <Route path="/invoice-manager" element={user ? <InvoiceManager /> : <Navigate to="/" replace />} />
        <Route path="/email-manager" element={user ? <EmailManager /> : <Navigate to="/" replace />} />
        <Route path="/emailsummary" element={user ? <EmailSummary /> : <Navigate to="/" replace />} />

        {/* ASSET MODULES */}
        <Route path="/asset-details" element={user ? <AssetDetails /> : <Navigate to="/" replace />} />
        <Route path="/scrap-items" element={user ? <ScrapItems /> : <Navigate to="/" replace />} />
        <Route path="/stock-items" element={user ? <StockItems /> : <Navigate to="/" replace />} />
        <Route path="/asset-summary" element={user ? <AssetSummary /> : <Navigate to="/" replace />} />
        <Route path="/user-allotments" element={user ? <UserAllotments /> : <Navigate to="/" replace />} />
    

        {/* COST MODULES */}
        <Route path="/cost-manager" element={user ? <CostManager /> : <Navigate to="/" replace />} />
        <Route path="/cost-summary" element={user ? <CostSummary /> : <Navigate to="/" replace />} />

        {/* RENEWAL */}
        <Route path="/renewal" element={user ? <Renewal /> : <Navigate to="/" replace />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
