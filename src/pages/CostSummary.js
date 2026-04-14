import React, { useEffect, useState, useCallback } from "react";
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
  Grid,
  Button,
  TextField,
  MenuItem,
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
  CartesianGrid,
} from "recharts";

import * as XLSX from "xlsx";

const API = "http://localhost:5000/api/cost-summary";

const COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c",
  "#d62728", "#9467bd", "#8c564b",
  "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

function CostSummary() {
  const [summary, setSummary] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterAccount, setFilterAccount] = useState("");

  const [locations, setLocations] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [monthWise, setMonthWise] = useState([]);
  // eslint-disable-next-line
  const [locationWise, setLocationWise] = useState([]); // not used but kept for future charts
  const [accountWise, setAccountWise] = useState([]);

 const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split("-");
  const date = new Date(year, month - 1); // still used, ESLint happy
  const shortMonth = date.toLocaleString("default", { month: "short" }); // 'Sep'
  const shortYear = year.slice(-2); // '25'
  return `${shortMonth}-${shortYear}`; // 'Sep-25'
};

  const getLastSixMonths = (rows) => {
    const months = [...new Set(rows.map((r) => r.Month))].sort();
    return months.slice(-6);
  };

  // ------------------ Build Month-wise chart ------------------
  const buildMonthWise = useCallback((rows) => {
    const latest6 = getLastSixMonths(rows);
    const result = {};

    rows.forEach((r) => {
      if (!latest6.includes(r.Month)) return;

      if (!result[r.Month]) result[r.Month] = { Month: formatMonth(r.Month) };
      result[r.Month][r.Location] = (result[r.Month][r.Location] || 0) + r.TotalCost;

      // Month vs Account
      const acc = r["Cost Account"];
      result[r.Month][acc] = (result[r.Month][acc] || 0) + r.TotalCost;
    });

    return Object.values(result);
  }, []);

  // ------------------ Build Location-wise chart ------------------
  const buildLocationWise = useCallback((rows) => {
    const result = {};
    rows.forEach((r) => {
      result[r.Location] = (result[r.Location] || 0) + r.TotalCost;
    });
    return Object.entries(result).map(([Location, TotalCost]) => ({
      name: Location,
      value: TotalCost,
      Location,
      TotalCost,
    }));
  }, []);

  // ------------------ Build Account vs Location chart ------------------
  const buildAccountWise = useCallback((rows) => {
    const result = {};
    rows.forEach((r) => {
      const acc = r["Cost Account"];
      const loc = r.Location;
      if (!result[acc]) result[acc] = { "Cost Account": acc };
      result[acc][loc] = (result[acc][loc] || 0) + r.TotalCost;
    });
    return Object.values(result);
  }, []);

  // ------------------ Apply filters ------------------
  const applyFilters = useCallback(() => {
    let data = [...summary];

    if (fromDate)
      data = data.filter((d) => new Date(d.Month + "-01") >= new Date(fromDate));
    if (toDate)
      data = data.filter((d) => new Date(d.Month + "-01") <= new Date(toDate));
    if (filterLocation)
      data = data.filter((d) => d.Location === filterLocation);
    if (filterAccount)
      data = data.filter((d) => d["Cost Account"] === filterAccount);

    setFiltered(data);
    setMonthWise(buildMonthWise(data));
    setLocationWise(buildLocationWise(data));
    setAccountWise(buildAccountWise(data));
  }, [
    summary,
    fromDate,
    toDate,
    filterLocation,
    filterAccount,
    buildMonthWise,
    buildLocationWise,
    buildAccountWise,
  ]);

  // ------------------ Load API data ------------------
  const loadSummary = useCallback(() => {
    axios
      .get(API)
      .then((res) => {
        setSummary(res.data);
        setFiltered(res.data);
        setLocations([...new Set(res.data.map((s) => s.Location))]);
        setAccounts([...new Set(res.data.map((s) => s["Cost Account"]))]);
        setMonthWise(buildMonthWise(res.data));
        setLocationWise(buildLocationWise(res.data));
        setAccountWise(buildAccountWise(res.data));
      })
      .catch((err) => console.error("Error:", err));
  }, [buildMonthWise, buildLocationWise, buildAccountWise]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { applyFilters(); }, [applyFilters]);


  // ------------------ Export Excel ------------------
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, "cost-summary.xlsx");
  };

  const uniqueLocations = [...new Set(summary.map((s) => s.Location))];

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
{/* ------------------ FILTERS ------------------ */}
{/* ------------------ FILTERS ------------------ */}
<Paper
  elevation={3}
  sx={{
    p: 2,
    mb: 3,
    backgroundColor: "#f5f7fa",
    borderRadius: 2,
  }}
>
  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
    Filters
  </Typography>

  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} sm={6} md={3}>
      <TextField
        fullWidth
        type="date"
        label="From Date"
        InputLabelProps={{ shrink: true }}
        size="small"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <TextField
        fullWidth
        type="date"
        label="To Date"
        InputLabelProps={{ shrink: true }}
        size="small"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <TextField
        select
        fullWidth
        label="Location"
        size="small"
        value={filterLocation}
        onChange={(e) => setFilterLocation(e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        {locations.map((loc) => (
          <MenuItem key={loc} value={loc}>
            {loc}
          </MenuItem>
        ))}
      </TextField>
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <TextField
        select
        fullWidth
        label="Cost Account"
        size="small"
        value={filterAccount}
        onChange={(e) => setFilterAccount(e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        {accounts.map((acc) => (
          <MenuItem key={acc} value={acc}>
            {acc}
          </MenuItem>
        ))}
      </TextField>
    </Grid>

    <Grid item xs={12} sx={{ textAlign: "right", mt: 1 }}>
      <Button variant="contained" onClick={exportExcel}>
        Export Excel
      </Button>
    </Grid>
  </Grid>
</Paper>



        {/* ------------------ Month vs Location ------------------ */}
        <Paper style={{ padding: 20, marginBottom: 40 }}>
          <Typography variant="h6" gutterBottom>
            Month vs Location-wise Total Cost (Last 6 Months)
          </Typography>
          <div style={{ display: "flex", gap: 20, width: "100%" }}>
            <div style={{ width: "65%", minWidth: 400, height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthWise} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Month" />
                  <YAxis />
                  <Tooltip formatter={(v) => Number(v).toFixed(0)} />
                  <Legend />
                  {uniqueLocations.map((loc, i) => <Bar key={loc} dataKey={loc} fill={COLORS[i % COLORS.length]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{
              width: "35%", maxHeight: 350, overflowY: "auto",
              padding: 10, border: "1px solid #ddd", borderRadius: 8, background: "white"
            }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>Chart Data</Typography>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Month</strong></TableCell>
                    {uniqueLocations.map((loc) => <TableCell key={loc}><strong>{loc}</strong></TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthWise.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.Month}</TableCell>
                      {uniqueLocations.map((loc) => (
                        <TableCell key={loc}>{row[loc] ? Number(row[loc]).toFixed(0) : 0}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Paper>

        {/* ------------------ Month vs Account and Account vs Location side by side ------------------ */}
        <Grid container spacing={2} style={{ marginBottom: 40 }}>
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 20, maxHeight: 450, overflow: "auto" }}>
              <Typography variant="h6" gutterBottom>Month vs Account-wise Total Cost (Last 6 Months)</Typography>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Month</strong></TableCell>
                    {accounts.map((acc) => <TableCell key={acc}><strong>{acc}</strong></TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthWise.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.Month}</TableCell>
                      {accounts.map((acc) => (
                        <TableCell key={acc}>{row[acc] ? Number(row[acc]).toFixed(0) : 0}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 20, maxHeight: 450, overflow: "auto" }}>
              <Typography variant="h6" gutterBottom>Account vs Location-wise Total Cost (Last 6 Months)</Typography>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Account</strong></TableCell>
                    {uniqueLocations.map((loc) => <TableCell key={loc}><strong>{loc}</strong></TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accountWise.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row["Cost Account"]}</TableCell>
                      {uniqueLocations.map((loc) => (
                        <TableCell key={loc}>{row[loc] ? Number(row[loc]).toFixed(0) : 0}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>

        {/* ------------------ SUMMARY TABLE ------------------ */}
        <Paper style={{ padding: 0, maxHeight: 450, overflow: "auto" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 3, background: "#1565c0", padding: "12px 20px", color: "white", fontSize: "18px", fontWeight: "bold", borderBottom: "2px solid #fff" }}>
            Summary Table
          </div>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {["Month", "Location", "Cost Account", "Total Cost"].map((h) => (
                  <TableCell key={h} sx={{ backgroundColor: "#1976d2", color: "white", fontWeight: "bold", position: "sticky", top: 48, zIndex: 2, minWidth: 150 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row, i) => (
                <TableRow key={i} sx={{ background: i % 2 ? "#fff" : "#f5f7ff" }}>
                  <TableCell>{formatMonth(row.Month)}</TableCell>
                  <TableCell>{row.Location}</TableCell>
                  <TableCell>{row["Cost Account"]}</TableCell>
                  <TableCell>{Number(row.TotalCost).toFixed(0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    </div>
  );
}

export default CostSummary;
