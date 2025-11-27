import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

const API_URL = process.env.REACT_APP_API_URL;
const API = `${API_URL}/cost-summary`;

const COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
];

// Format month from YYYY-MM to MMM-YY
const formatMonth = (monthStr) => {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleString("default", { month: "short" }) + "-" + year.slice(-2);
};

const CostSummary = () => {
  const [summary, setSummary] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [locations, setLocations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [monthWise, setMonthWise] = useState([]);
  const [monthAccountWise, setMonthAccountWise] = useState([]);
  const [accountWise, setAccountWise] = useState([]);

  // ----------------- Helpers -----------------
  const getLastSixMonths = (rows) => {
    const months = [...new Set(rows.map(r => r.month))].sort();
    return months.slice(-6);
  };

  // Month vs Location
  const buildMonthWise = useCallback((rows) => {
    const latest6 = getLastSixMonths(rows);
    const result = {};
    rows.forEach(r => {
      if (!latest6.includes(r.month)) return;
      if (!result[r.month]) result[r.month] = { Month: formatMonth(r.month) };
      result[r.month][r.location] = (result[r.month][r.location] || 0) + r.totalcost;
    });
    return Object.values(result);
  }, []);

  // Month vs Account
  const buildMonthAccountWise = useCallback((rows) => {
    const latest6 = getLastSixMonths(rows);
    const result = {};
    rows.forEach(r => {
      if (!latest6.includes(r.month)) return;
      if (!result[r.month]) result[r.month] = { Month: formatMonth(r.month) };
      result[r.month][r["Cost Account"]] = (result[r.month][r["Cost Account"]] || 0) + r.totalcost;
    });
    return Object.values(result);
  }, []);

  // Account vs Location
  const buildAccountWise = useCallback((rows) => {
    const result = {};
    rows.forEach(r => {
      const acc = r["Cost Account"];
      const loc = r.location;
      if (!result[acc]) result[acc] = { "Cost Account": acc };
      result[acc][loc] = (result[acc][loc] || 0) + r.totalcost;
    });
    return Object.values(result);
  }, []);

  const applyFilters = useCallback(() => {
    let data = [...summary];
    if (fromDate) data = data.filter(d => new Date(d.month + "-01") >= new Date(fromDate));
    if (toDate) data = data.filter(d => new Date(d.month + "-01") <= new Date(toDate));
    if (filterLocation) data = data.filter(d => d.location === filterLocation);
    if (filterAccount) data = data.filter(d => d["Cost Account"] === filterAccount);

    setFiltered(data);
    setMonthWise(buildMonthWise(data));
    setMonthAccountWise(buildMonthAccountWise(data));
    setAccountWise(buildAccountWise(data));
  }, [summary, fromDate, toDate, filterLocation, filterAccount, buildMonthWise, buildMonthAccountWise, buildAccountWise]);

  const loadSummary = useCallback(() => {
    axios.get(API)
      .then(res => {
        const rows = res.data || [];
        setSummary(rows);
        setFiltered(rows);
        setLocations([...new Set(rows.map(s => s.location))]);
        setAccounts([...new Set(rows.map(s => s["Cost Account"]))]);
        setMonthWise(buildMonthWise(rows));
        setMonthAccountWise(buildMonthAccountWise(rows));
        setAccountWise(buildAccountWise(rows));
      })
      .catch(err => console.error("Error loading summary:", err));
  }, [buildMonthWise, buildMonthAccountWise, buildAccountWise]);

  useEffect(() => loadSummary(), [loadSummary]);
  useEffect(() => applyFilters(), [applyFilters]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, "cost-summary.xlsx");
  };

  const uniqueLocations = [...new Set(summary.map(s => s.location))];

  return (
    <div style={{ background: "#91b6ecff", minHeight: "100vh" }}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton color="inherit" href="/cost-manager">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Cost Summary Dashboard</Typography>
        </Toolbar>
      </AppBar>

      <div style={{ padding: 15 }}>
        {/* FILTERS */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: "#f5f7fa", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth type="date" label="From Date" InputLabelProps={{ shrink: true }} size="small" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth type="date" label="To Date" InputLabelProps={{ shrink: true }} size="small" value={toDate} onChange={e => setToDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Location" size="small" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {locations.map(loc => <MenuItem key={loc} value={loc}>{loc}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Cost Account" size="small" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {accounts.map(acc => <MenuItem key={acc} value={acc}>{acc}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "right", mt: 1 }}>
              <Button variant="contained" onClick={exportExcel}>Export Excel</Button>
            </Grid>
          </Grid>
        </Paper>

        {/* MONTH vs LOCATION CHART */}
        <Paper style={{ padding: 20, marginBottom: 40 }}>
          <Typography variant="h6" gutterBottom>Month vs Location-wise Total Cost (Last 6 Months)</Typography>
          <div style={{ display: "flex", gap: 20, width: "100%" }}>
            <div style={{ width: "65%", minWidth: 400, height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthWise}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {uniqueLocations.map((loc, i) => <Bar key={loc} dataKey={loc} fill={COLORS[i % COLORS.length]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Chart Data Table */}
            <div style={{ width: "35%", maxHeight: 350, overflowY: "auto", padding: 10, border: "1px solid #ddd", borderRadius: 8, background: "white" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>Chart Data</Typography>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Month</strong></TableCell>
                    {uniqueLocations.map(loc => <TableCell key={loc}><strong>{loc}</strong></TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthWise.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.Month}</TableCell>
                      {uniqueLocations.map(loc => <TableCell key={loc}>{row[loc] ? Number(row[loc]).toFixed(0) : 0}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Paper>

        {/* MONTH vs ACCOUNT TABLE */}
        <Grid container spacing={2} style={{ marginBottom: 40 }}>
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 20, maxHeight: 450, overflow: "auto" }}>
              <Typography variant="h6" gutterBottom>Month vs Account-wise Total Cost (Last 6 Months)</Typography>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Month</strong></TableCell>
                    {accounts.map(acc => <TableCell key={acc}><strong>{acc}</strong></TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthAccountWise.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.Month}</TableCell>
                      {accounts.map(acc => <TableCell key={acc}>{row[acc] ? Number(row[acc]).toFixed(0) : 0}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {/* ACCOUNT vs LOCATION TABLE */}
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 20, maxHeight: 450, overflow: "auto" }}>
              <Typography variant="h6" gutterBottom>Account vs Location-wise Total Cost (Last 6 Months)</Typography>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Account</strong></TableCell>
                    {uniqueLocations.map(loc => <TableCell key={loc}><strong>{loc}</strong></TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accountWise.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row["Cost Account"]}</TableCell>
                      {uniqueLocations.map(loc => <TableCell key={loc}>{row[loc] ? Number(row[loc]).toFixed(0) : 0}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>

        {/* SUMMARY TABLE */}
        <Paper style={{ padding: 0, maxHeight: 450, overflow: "auto" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 3, background: "#1565c0", padding: "12px 20px", color: "white", fontSize: "18px", fontWeight: "bold", borderBottom: "2px solid #fff" }}>
            Summary Table
          </div>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {["Month", "Location", "Cost Account", "Total Cost"].map(h => (
                  <TableCell key={h} sx={{ backgroundColor: "#1976d2", color: "white", fontWeight: "bold", position: "sticky", top: 48, zIndex: 2, minWidth: 150 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row, i) => (
                <TableRow key={i} sx={{ background: i % 2 ? "#fff" : "#f5f7ff" }}>
                  <TableCell>{formatMonth(row.month)}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row["Cost Account"]}</TableCell>
                  <TableCell>{Number(row.totalcost).toFixed(0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    </div>
  );
};

export default CostSummary;
