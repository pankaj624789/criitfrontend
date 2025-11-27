import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_URL = process.env.REACT_APP_API_URL; // from .env
const API = `${API_URL}/cost-details`;

// Correct form structure (field names from DB)
const emptyForm = {
  date: "",
  location: "",
  cost_account: "",
  cost_details: "",
  amount: "",
  payment_date: "",
};

function CostManager() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await axios.get(API);
      setData(res.data);
      setFilteredData(res.data);
    } catch (err) {
      alert("Unable to load cost details.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
        alert("Updated Successfully");
      } else {
        await axios.post(API, form);
        alert("Added Successfully");
      }
      setOpen(false);
      loadData();
    } catch (err) {
      alert("Error saving data.");
      console.error(err);
    }
  };

  const editItem = (item) => {
    setForm({
      date: item.date ? item.date.split("T")[0] : "",
      location: item.location,
      cost_account: item.cost_account,
      cost_details: item.cost_details,
      amount: item.amount,
      payment_date: item.payment_date ? item.payment_date.split("T")[0] : "",
    });
    setEditingId(item.sn);
    setOpen(true);
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      loadData();
    } catch (err) {
      alert("Error deleting entry.");
      console.error(err);
    }
  };

  // -------------------------------
  // SEARCH FILTER
  // -------------------------------
  const handleSearch = () => {
    if (!searchText) {
      setFilteredData(data);
      return;
    }
    const lower = searchText.toLowerCase();
    const filtered = data.filter(
      (row) =>
        (row.location && row.location.toLowerCase().includes(lower)) ||
        (row.cost_account && row.cost_account.toLowerCase().includes(lower))
    );
    setFilteredData(filtered);
  };

  return (
    <div style={{ background: "#f7f9fc", minHeight: "100vh" }}>
      <AppBar position="sticky" sx={{ background: "#1565c0" }}>
        <Toolbar>
          <IconButton color="inherit" href="/dashboard">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Cost Manager
          </Typography>

          {/* Search */}
          <TextField
            placeholder="Search by Location / Account"
            size="small"
            variant="outlined"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ mr: 1, background: "white", borderRadius: 1 }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSearch}
            sx={{ mr: 2 }}
          >
            Search
          </Button>

          {/* Add Button */}
          <Button variant="outlined" color="inherit" onClick={openAdd} sx={{ mr: 2 }}>
            Add
          </Button>

          {/* Summary Page */}
          <Button variant="contained" color="secondary" href="/cost-summary">
            Summary
          </Button>
        </Toolbar>
      </AppBar>

      <Paper
        style={{
          margin: 20,
          borderRadius: 12,
          boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ background: "#1976d2", color: "white" }}>
                {[
                  "S/N",
                  "Date",
                  "Location",
                  "Cost Account",
                  "Cost Details",
                  "Amount",
                  "Payment Date",
                  "Actions",
                ].map((h) => (
                  <th key={h} style={head}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, i) => (
                <tr key={row.sn} style={{ background: i % 2 ? "#fff" : "#f3f7ff" }}>
                  <td style={cell}>{row.sn}</td>
                  <td style={cell}>{row.date ? row.date.split("T")[0] : ""}</td>
                  <td style={cell}>{row.location}</td>
                  <td style={cell}>{row.cost_account}</td>
                  <td style={cell}>{row.cost_details}</td>
                  <td style={cell}>{row.amount}</td>
                  <td style={cell}>{row.payment_date ? row.payment_date.split("T")[0] : ""}</td>
                  <td style={cell}>
                    <Button size="small" onClick={() => editItem(row)}>
                      Edit
                    </Button>
                    <Button color="error" size="small" onClick={() => deleteItem(row.sn)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Paper>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Update Entry" : "Add Entry"}</DialogTitle>
        <DialogContent dividers>
          <div style={{ display: "grid", gap: 15 }}>
            {Object.keys(emptyForm).map((key) => (
              <TextField
                key={key}
                label={key.replace("_", " ").toUpperCase()}
                name={key}
                value={form[key] || ""}
                onChange={handleChange}
                fullWidth
                type={
                  key.includes("date")
                    ? "date"
                    : key === "amount"
                    ? "number"
                    : "text"
                }
                InputLabelProps={key.includes("date") ? { shrink: true } : undefined}
              />
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const head = { padding: 10, fontWeight: "bold", borderBottom: "1px solid #ccc" };
const cell = { padding: 10, borderBottom: "1px solid #eee" };

export default CostManager;

