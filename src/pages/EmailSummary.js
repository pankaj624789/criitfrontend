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

const API = "http://localhost:5000/api/email-summary";

function EmailSummary() {
  const [summary, setSummary] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadSummary();
  }, []);

  // -------------------------------
  // Transform SQL Output → Chart Data
  // -------------------------------
  const transformChartData = (rows) => {
    const result = {};

    rows.forEach((r) => {
      if (!result[r.Location]) {
        result[r.Location] = { Location: r.Location };
      }
      result[r.Location][r.Particular] = r.TotalCount;
    });

    return Object.values(result);
  };

  const loadSummary = async () => {
    try {
      const res = await axios.get(API);

      setSummary(res.data);
      setChartData(transformChartData(res.data));
    } catch (err) {
      console.error("Error loading summary:", err);
      alert("Unable to load Email Summary.");
    }
  };

  // Extract unique particulars to auto-create bars
  const uniqueParticulars = [...new Set(summary.map((s) => s.Particular))];

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

      {/* Side-by-Side Container */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Chart Panel */}
        <Paper
          style={{
            flex: 1,
            minWidth: "400px",
            padding: 20,
          }}
        >
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

        {/* Table Panel */}
        <Paper
          style={{
            flex: 1,
            minWidth: "400px",
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
              <TableRow style={{ background: "#1976d2" }}>
                <TableCell style={{ color: "white" }}>Location</TableCell>
                <TableCell style={{ color: "white" }}>Particular</TableCell>
                <TableCell style={{ color: "white" }}>Count</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {summary.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.Location}</TableCell>
                  <TableCell>{row.Particular}</TableCell>
                  <TableCell>{row.TotalCount}</TableCell>
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

