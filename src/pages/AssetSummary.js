import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const styles = {
  backBtn: {
    background: "#257206ff",
    color: "#fff",
    marginBottom: 15,
    border: "none",
    borderRadius: 6,
    padding: "8px 12px",
    cursor: "pointer",
  },
};

const AssetSummary = () => {
  const [summary, setSummary] = useState([]);
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);

  // NEW: Stock summary
  const [stockSummary, setStockSummary] = useState([]);

  // Fetch stock summary
  const fetchStockSummary = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stock-summary");
      setStockSummary(res.data);
    } catch (err) {
      console.error("Error loading stock summary:", err);
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/locations");
      setLocations(res.data);
    } catch (err) {
      console.error("Error loading locations:", err);
    }
  };

  // Fetch asset summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/asset-summary", {
        params: { location },
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  }, [location]);

  useEffect(() => {
    fetchLocations();
    fetchStockSummary();     // <---- Load stock summary on page load
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const totalDesktopLaptop = summary.reduce((a, b) => a + b.DesktopLaptop, 0);
  const totalLaptop = summary.reduce((a, b) => a + b.Laptop, 0);
  const totalPrinter = summary.reduce((a, b) => a + b.Printer, 0);

  const chartData = [
    { name: "Desktop & Laptop", qty: totalDesktopLaptop },
    { name: "Laptop", qty: totalLaptop },
    { name: "Printer", qty: totalPrinter },
  ];

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>

      {/* Fixed Stylish Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "98%",
        background: "linear-gradient(90deg, #004e92, #000428)",
        color: "white",
        padding: "10px 18px",
        fontSize: "18px",
        fontWeight: "bold",
        letterSpacing: "0.3px",
        zIndex: 600,
        boxShadow: "0 3px 6px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>📊</span>
          <span>Departmentwise Asset Summary</span>
        </div>

        <button
          style={{
            background: "#ffcc00",
            border: "none",
            padding: "8px 10px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => (window.location.href = "/asset-details")}
        >
          🖥 Asset Details
        </button>

      </div>

      {/* Main layout container */}
      <div style={{ display: "flex", marginTop: 80 }}>

        {/* LEFT SIDE — Asset Filter + Chart + Table */}
        <div style={{ width: "60%" }}>

          {/* Filter Card */}
          <div
            style={{
              display: "flex",
              width: "510px",
              gap: 20,
              marginBottom: 5,
              padding: 5,
              borderRadius: 10,
              background: "#92f0f0ff",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div>
              <label><b>Filter by Location</b></label><br />
              <select
                onChange={(e) => setLocation(e.target.value)}
                value={location}
                style={{
                  padding: 6,
                  marginTop: 0,
                  width: "450px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">All Locations</option>

                {locations.map((loc, idx) => (
                  <option key={idx} value={loc.Location}>
                    {loc.Location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Card */}
          <div
            style={{
              width: "69%",
              height: 140,
              background: "#b8e7e9ff",
              padding: 10,
              borderRadius: 10,
              marginBottom: 5,
              boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 5px 0", padding: 0 }}>
              Overall Asset Distribution
            </h3>

            <ResponsiveContainer width="95%" height="75%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="qty" fill="#2986cc" barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Asset Table */}
          <div
            style={{
              background: "#5bcdf0ff",
              width: "70%",
              padding: 6,
              borderRadius: 10,
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
              }}
            >
              <thead>
                <tr style={{ background: "#d4aa00", color: "#fff" }}>
                  <th style={{ padding: 10 }}>Department</th>
                  <th>Desktop & Laptop</th>
                  <th>Laptop</th>
                  <th>Printer</th>
                </tr>
              </thead>

              <tbody>
                {summary.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f8f8f8" : "#f5ceceff" }}>
                    <td style={{ padding: 3, textAlign: "left" }}>{row.Department}</td>
                    <td>{row.DesktopLaptop}</td>
                    <td>{row.Laptop}</td>
                    <td>{row.Printer}</td>
                  </tr>
                ))}

                <tr style={{ background: "#ffd966", fontWeight: "bold" }}>
                  <td>Total</td>
                  <td>{totalDesktopLaptop}</td>
                  <td>{totalLaptop}</td>
                  <td>{totalPrinter}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE — STOCK SUMMARY */}
        <div
          style={{
            width: "40%",
            paddingLeft: 20,
          }}
        >
          <h3 style={{ marginBottom: 10 }}>📦 Stock Summary (IT Department)</h3>

          <div
            style={{
              background: "#ffe599",
              padding: 10,
              borderRadius: 10,
              boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
              width: "95%",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
              }}
            >
              <thead>
                <tr style={{ background: "#cc9900", color: "#fff" }}>
                  <th style={{ padding: 8 }}>Stock At</th>
                  <th>Item Type</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {stockSummary.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9e6c9" }}>
                    <td>IT Department</td>
                    <td>{row["Item Type"]}</td>
                    <td>{row.Total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AssetSummary;
