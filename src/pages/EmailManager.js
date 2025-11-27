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
const API = `${API_URL}/emailids`;


// Internal form uses snake_case as per DB
const emptyForm = {
  first_name: "",
  last_name: "",
  email_address: "",
  location: "",
  particular: "",
  remarks: "",
};

// UI labels
const labelMap = {
  first_name: "First Name",
  last_name: "Last Name",
  email_address: "Email Address",
  location: "Location",
  particular: "Particular",
  remarks: "Remarks",
};

function EmailManager() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  /** Load Data */
  const load = useCallback(async () => {
    try {
      const res = await axios.get(API, { params: { search } });
      setData(res.data.data);
    } catch (err) {
      console.error("Load error:", err);
      alert("Failed to load data");
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  /** Handle Input Change */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /** Open Add Modal */
  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  /** Save or Update */
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
      load();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save. Check API & DB field names.");
    }
  };

  /** Edit Existing Row */
  const editItem = (item) => {
    setForm({
      first_name: item.first_name,
      last_name: item.last_name,
      email_address: item.email_address,
      location: item.location,
      particular: item.particular,
      remarks: item.remarks,
    });

    setEditingId(item.sn);
    setOpen(true);
  };

  /** Delete */
  const deleteItem = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      load();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ background: "#f7f9fc", minHeight: "100vh" }}>
      <AppBar position="sticky" sx={{ background: "#1565c0" }}>
        <Toolbar>
          <IconButton color="inherit" href="/dashboard">
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            E-Mail ID Manager
          </Typography>

          <Button
            variant="outlined"
            color="inherit"
            href="/emailsummary"
            sx={{ mr: 1 }}
          >
            Summary
          </Button>

          <Button variant="outlined" color="inherit" onClick={openAdd}>
            Add
          </Button>
        </Toolbar>
      </AppBar>

      {/* Search */}
      <div style={{ padding: 20 }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </div>

      {/* Table */}
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
                <th style={head}>S/N</th>
                <th style={head}>First Name</th>
                <th style={head}>Last Name</th>
                <th style={head}>Email Address</th>
                <th style={head}>Location</th>
                <th style={head}>Particular</th>
                <th style={head}>Remarks</th>
                <th style={head}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.sn}
                  style={{ background: i % 2 ? "#fff" : "#f3f7ff" }}
                >
                  <td style={cell}>{row.sn}</td>
                  <td style={cell}>{row.first_name}</td>
                  <td style={cell}>{row.last_name}</td>
                  <td style={cell}>{row.email_address}</td>
                  <td style={cell}>{row.location}</td>
                  <td style={cell}>{row.particular}</td>
                  <td style={cell}>{row.remarks}</td>

                  <td style={cell}>
                    <Button size="small" onClick={() => editItem(row)}>
                      Edit
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => deleteItem(row.sn)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Paper>

      {/* Popup */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Update Entry" : "Add Entry"}</DialogTitle>

        <DialogContent dividers>
          <div style={{ display: "grid", gap: 15 }}>
            {Object.keys(emptyForm).map((key) => (
              <TextField
                key={key}
                label={labelMap[key]}
                name={key}
                value={form[key] || ""}
                onChange={handleChange}
                fullWidth
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

const head = {
  padding: 10,
  fontWeight: "bold",
  borderBottom: "1px solid #ccc",
};

const cell = {
  padding: 10,
  borderBottom: "1px solid #eee",
};

export default EmailManager;

