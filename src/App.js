import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./login";
import Dashboard from "./dashboard";

// Pages
import Indent from "./pages/Indent";
import Quotations from "./pages/Quotations";
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

  return (
    <Router>
      <Routes>

        {/* Login or Dashboard (Root Route) */}
        <Route
          path="/"
          element={
            !user ? (
              <Login onLogin={(username) => setUser(username)} />
            ) : (
              <Dashboard setUser={setUser} />
            )
          }
        />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard setUser={setUser} />} />
        
        <Route path="/indent" element={<Indent />} />
        <Route path="/quotations" element={<Quotations />} />
        
        <Route path="/invoice-manager" element={<InvoiceManager />} />
        <Route path="/email-manager" element={<EmailManager />} />
        <Route path="/emailsummary" element={<EmailSummary />} />

        {/* Asset Modules */}
        <Route path="/asset-details" element={<AssetDetails />} />
        <Route path="/scrap-items" element={<ScrapItems />} />
        <Route path="/stock-items" element={<StockItems />} />
        <Route path="/asset-summary" element={<AssetSummary />} />
        <Route path="/cost-manager" element={<CostManager />} />
        <Route path="/cost-summary" element={<CostSummary />} />


      </Routes>
    </Router>
  );
}

export default App;


