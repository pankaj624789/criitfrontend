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

const API = "http://localhost:5000/api/emailids";

const emptyForm = {
  "First Name": "",
  "Last Name": "",
  "Email Address": "",
  Location: "",
  Particular: "",
  Remarks: "",
};

function EmailManager() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    const res = await axios.get(API, { params: { search } });
    setData(res.data.data);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  const save = async () => {
    if (editingId) {
      await axios.put(`${API}/${editingId}`, form);
      alert("Updated Successfully");
    } else {
      await axios.post(API, form);
      alert("Added Successfully");
    }
    setOpen(false);
    load();
  };

  const editItem = (item) => {
    setForm(item);
    setEditingId(item["S/N"]);
    setOpen(true);
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete?")) return;
    await axios.delete(`${API}/${id}`);
    load();
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

    {/* ➤ Link to Summary Page */}
    <Button
      variant="outlined"
      color="inherit"
      href="/emailsummary"
      style={{ marginRight: 10 }}
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

      {/* Table Container with Scrolling */}
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
                  key={row["S/N"]}
                  style={{ background: i % 2 ? "#fff" : "#f3f7ff" }}
                >
                  <td style={cell}>{row["S/N"]}</td>
                  <td style={cell}>{row["First Name"]}</td>
                  <td style={cell}>{row["Last Name"]}</td>
                  <td style={cell}>{row["Email Address"]}</td>
                  <td style={cell}>{row.Location}</td>
                  <td style={cell}>{row.Particular}</td>
                  <td style={cell}>{row.Remarks}</td>

                  <td style={cell}>
                    <Button size="small" onClick={() => editItem(row)}>
                      Edit
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => deleteItem(row["S/N"])}
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
                label={key}
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
