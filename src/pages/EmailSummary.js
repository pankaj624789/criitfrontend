import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL; // from .env
const API = `${API_URL}/email-summary`;

function EmailSummary() {
  const [summary, setSummary] = useState([]);
  const [chartData, setChartData] = useState([]);

  // ------------------------------- 
  // Load summary inside useEffect
  // -------------------------------
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await axios.get(API);
        const data = res.data || [];
        setSummary(data);
        setChartData(transformChartData(data));
      } catch (err) {
        console.error("Error loading summary:", err);
        alert("Unable to load Email Summary.");
      }
    };

    loadSummary();
  }, []);

  // ------------------------------- 
  // Transform SQL Output → Chart Data
  // -------------------------------
  const transformChartData = (rows) => {
    const result = {};

    rows.forEach((r) => {
      if (!result[r.location]) result[r.location] = { Location: r.location };
      result[r.location][r.particular] = parseInt(r.totalcount);
    });

    return Object.values(result);
  };

  // Extract unique particulars FOR BAR KEYS
  const uniqueParticulars = [...new Set(summary.map((s) => s.particular))];

  return (
    <div style={{ background: "#f7f9fc", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ background: "#1565c0" }}>
        <Toolbar>
          <IconButton color="inherit" href="/email-manager">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Email Summary (Location-wise Particular Count)
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Layout */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Chart Section */}
        <Paper style={{ flex: 1, minWidth: 400, padding: 20 }}>
          <Typography variant="h6" gutterBottom>
            Summary Chart (Location + Particular)
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="Location" />
              <YAxis />
              <Tooltip />
              <Legend />
              {uniqueParticulars.map((part, i) => (
                <Bar key={i} dataKey={part} name={part} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Table Section */}
        <Paper
          style={{
            flex: 1,
            minWidth: 400,
            padding: 20,
            maxHeight: 450,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Summary Table
          </Typography>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {["Location", "Particular", "Count"].map((h) => (
                  <TableCell
                    key={h}
                    style={{ background: "#1976d2", color: "white" }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.particular}</TableCell>
                  <TableCell>{row.totalcount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    </div>
  );
}

export default EmailSummary;
