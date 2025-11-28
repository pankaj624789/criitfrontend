// src/pages/Renewal.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  InputAdornment,
  Badge,
  Menu,
  MenuItem as MUIMenuItem,
  ListItemText,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";

// API
const API_URL =
  process.env.REACT_APP_API_URL ;
const API = `${API_URL}/renewals`;

/* ---------- Helper: frequency -> months ---------- */
const frequencyToMonths = (frequency = "") => {
  const f = frequency.toLowerCase();
  if (f === "monthly") return 1;
  if (f === "quarterly") return 3;
  if (f === "half-yearly" || f === "half yearly") return 6;
  if (f === "yearly" || f === "annual") return 12;
  return null;
};

const toInputDate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "");
const toDisplayDate = (d) => (d ? dayjs(d).format("DD-MM-YYYY") : "-");

const emptyForm = {
  sn: "",
  compliance_particulars: "",
  last_year_details: "",
  authority_provider: "",
  auth_address: "",
  law_statute: "",
  last_due_date: "",
  actual_date_of_compliences: "",
  actual_cost: "",
  frequency: "Yearly",
  next_due_date: "",
  notification_status: "pending",
};

function Renewal() {
  const [rows, setRows] = useState([]);
  const [dueSoon, setDueSoon] = useState([]); // due soon items

  const [anchorEl, setAnchorEl] = useState(null);
  const openNotify = Boolean(anchorEl);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* =====================================================
     FETCH RENEWALS
     Auto-refresh every 20 seconds
  ======================================================= */
  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(data);

      // Compute due soon (within 2 months from today)
      const due = data.filter((row) => {
        if (!row.next_due_date) return false;
        const nextDue = dayjs(row.next_due_date);
        const today = dayjs();
        const twoMonthsLater = today.add(2, "month");
        return nextDue.isAfter(today.subtract(1, "day")) && nextDue.isBefore(twoMonthsLater.add(1, "day"));
      });
      setDueSoon(due);

    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to fetch renewals",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     USE EFFECT → AUTO REFRESH
  ======================================================= */
  useEffect(() => {
    fetchRenewals();
    const interval = setInterval(fetchRenewals, 20000);
    return () => clearInterval(interval);
  }, []);

  /* =====================================================
     FORM HANDLERS
  ======================================================= */
  const openCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setIsEdit(true);
    setEditingId(row.id);
    setForm({
      sn: row.sn ?? "",
      compliance_particulars: row.compliance_particulars ?? "",
      last_year_details: row.last_year_details ?? "",
      authority_provider: row.authority_provider ?? "",
      auth_address: row.auth_address ?? "",
      law_statute: row.law_statute ?? "",
      last_due_date: toInputDate(row.last_due_date),
      actual_date_of_compliences: toInputDate(row.actual_date_of_compliences),
      actual_cost: row.actual_cost ?? "",
      frequency: row.frequency ?? "Yearly",
      next_due_date: toInputDate(row.next_due_date),
      notification_status: row.notification_status ?? "pending",
    });
    setDialogOpen(true);
  };

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const computeNextDueDate = (formData) => {
    if (formData.next_due_date) return formData.next_due_date;
    const m = frequencyToMonths(formData.frequency);
    const base = formData.actual_date_of_compliences || formData.last_due_date;
    if (!base || m === null) return "";
    return dayjs(base).add(m, "month").format("YYYY-MM-DD");
  };

  const handleSave = async () => {
    if (!form.compliance_particulars.trim()) {
      setSnackbar({
        open: true,
        message: "Enter compliance particulars",
        severity: "warning",
      });
      return;
    }

    const payload = {
      sn: form.sn === "" ? null : Number(form.sn),
      compliance_particulars: form.compliance_particulars || null,
      last_year_details: form.last_year_details || null,
      authority_provider: form.authority_provider || null,
      auth_address: form.auth_address || null,
      law_statute: form.law_statute || null,
      last_due_date: form.last_due_date || null,
      actual_date_of_compliences: form.actual_date_of_compliences || null,
      actual_cost: form.actual_cost === "" ? null : Number(form.actual_cost),
      frequency: form.frequency || null,
      next_due_date: computeNextDueDate(form) || null,
      notification_status: form.notification_status || "pending",
    };

    try {
      setLoading(true);
      if (isEdit) {
        await axios.put(`${API}/${editingId}`, payload);
        setSnackbar({ open: true, message: "Updated", severity: "success" });
      } else {
        await axios.post(API, payload);
        setSnackbar({ open: true, message: "Created", severity: "success" });
      }
      setDialogOpen(false);
      fetchRenewals();
    } catch {
      setSnackbar({ open: true, message: "Save failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this renewal?")) return;
    try {
      setLoading(true);
      await axios.delete(`${API}/${id}`);
      setSnackbar({ open: true, message: "Deleted", severity: "success" });
      fetchRenewals();
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FILTER TABLE
  ======================================================= */
  const displayed = rows.filter((r) => {
    const s = search.toLowerCase();
    return (
      String(r.sn ?? "").toLowerCase().includes(s) ||
      (r.compliance_particulars ?? "").toLowerCase().includes(s) ||
      (r.authority_provider ?? "").toLowerCase().includes(s) ||
      (r.law_statute ?? "").toLowerCase().includes(s)
    );
  });

  /* =====================================================
     JSX START
  ======================================================= */
  return (
    <Box sx={{ p: 2 }}>
      {/* PAGE HEADER */}
      <Box
        sx={{
          p: 2,
          mb: 2,
          background: "#1976d2",
          color: "white",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography variant="h6">Renewal / Compliance</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notification Bell */}
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Badge badgeContent={dueSoon.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu anchorEl={anchorEl} open={openNotify} onClose={() => setAnchorEl(null)}>
            {dueSoon.length === 0 ? (
              <MUIMenuItem disabled>No upcoming renewals</MUIMenuItem>
            ) : (
              dueSoon.map((row) => (
                <MUIMenuItem key={row.id}>
                  <ListItemText
                    primary={`${row.compliance_particulars}`}
                    secondary={`Next Due: ${toDisplayDate(row.next_due_date)}`}
                  />
                </MUIMenuItem>
              ))
            )}
          </Menu>

          <Button
            onClick={() => (window.location.href = "/dashboard")}
            sx={{
              background: "white",
              color: "#1976d2",
              fontWeight: "bold",
              "&:hover": { background: "#e3e3e3" },
            }}
          >
            ⬅ Back
          </Button>
        </Box>
      </Box>

      {/* SEARCH + ADD */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SN</TableCell>
              <TableCell>Particulars</TableCell>
              <TableCell>Authority</TableCell>
              <TableCell>Last Due</TableCell>
              <TableCell>Next Due</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Notification</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayed.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.sn ?? "-"}</TableCell>
                <TableCell sx={{ maxWidth: 250 }}>{row.compliance_particulars}</TableCell>
                <TableCell>{row.authority_provider ?? "-"}</TableCell>
                <TableCell>{toDisplayDate(row.last_due_date)}</TableCell>
                <TableCell
                  sx={{
                    color:
                      row.next_due_date &&
                      dayjs(row.next_due_date).isBefore(dayjs(), "day")
                        ? "error.main"
                        : undefined,
                  }}
                >
                  {toDisplayDate(row.next_due_date)}
                </TableCell>
                <TableCell>{row.frequency}</TableCell>
                <TableCell>{row.actual_cost ?? "-"}</TableCell>
                <TableCell>{row.notification_status}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {displayed.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  {loading ? "Loading..." : "No records found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? "Edit Renewal" : "Add Renewal"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 2, mt: 1 }}>
            <TextField label="SN" name="sn" value={form.sn} onChange={handleChange} />
            <TextField label="Compliance Particulars" name="compliance_particulars" value={form.compliance_particulars} onChange={handleChange} required />
            <TextField label="Last Year Details" name="last_year_details" value={form.last_year_details} onChange={handleChange} />
            <TextField label="Authority Provider" name="authority_provider" value={form.authority_provider} onChange={handleChange} />
            <TextField label="Authority Address" name="auth_address" value={form.auth_address} onChange={handleChange} />
            <TextField label="Law / Statute" name="law_statute" value={form.law_statute} onChange={handleChange} />
            <TextField label="Last Due Date" name="last_due_date" type="date" InputLabelProps={{ shrink: true }} value={form.last_due_date} onChange={handleChange} />
            <TextField label="Actual Date of Compliance" name="actual_date_of_compliences" type="date" InputLabelProps={{ shrink: true }} value={form.actual_date_of_compliences} onChange={handleChange} />
            <TextField label="Actual Cost" name="actual_cost" type="number" value={form.actual_cost} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            <TextField select label="Frequency" name="frequency" value={form.frequency} onChange={handleChange}>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Quarterly">Quarterly</MenuItem>
              <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
            </TextField>
            <TextField label="Next Due Date (optional)" name="next_due_date" type="date" InputLabelProps={{ shrink: true }} value={form.next_due_date} onChange={handleChange} />
            <TextField select label="Notification Status" name="notification_status" value={form.notification_status} onChange={handleChange}>
              <MenuItem value="pending">pending</MenuItem>
              <MenuItem value="done">done</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{isEdit ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Renewal;

