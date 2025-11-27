// src/pages/InvoiceManager.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
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

const API_URL = process.env.REACT_APP_API_URL;
const API = `${API_URL}/invoices`;

// =============== FORM DEFAULTS ===============
const emptyForm = {
  indentDate: "",
  material: "",
  particular: "",
  quantity: "",
  uom: "",
  vendorName: "",
  poNumber: "",
  poDate: "",
  invoiceNumber: "",
  invoiceDate: "",
  invoiceValue: "",
  taxableValue: "",
  igst: "",
  cgst: "",
  sgst: "",
  billHanded: "",
  allocationDate: "",
  fixedAssetNumber: "",
  userName: "",
  useFrom: "",
  useTo: "",
  remarks: "",
};

// Convert camelCase → snake_case for API
const toBackend = (f) => ({
  indent_date: f.indentDate || null,
  material: f.material || null,
  particular: f.particular || null,
  quantity: f.quantity || null,
  uom: f.uom || null,
  vendor_name: f.vendorName || null,
  purchase_order_number: f.poNumber || null,
  purchase_order_date: f.poDate || null,
  invoice_number: f.invoiceNumber || null,
  invoice_date: f.invoiceDate || null,
  invoice_value: f.invoiceValue || null,
  taxable_value: f.taxableValue || null,
  igst: f.igst || null,
  cgst: f.cgst || null,
  sgst: f.sgst || null,
  bill_handed_over_to: f.billHanded || null,
  allocation_date: f.allocationDate || null,
  fixed_asset_number: f.fixedAssetNumber || null,
  user_name: f.userName || null,
  use_from: f.useFrom || null,
  use_to: f.useTo || null,
  remarks: f.remarks || null,
});

// Convert backend snake_case → camelCase for editing
const toForm = (inv) => ({
  indentDate: inv.indent_date?.substring(0, 10) || "",
  material: inv.material || "",
  particular: inv.particular || "",
  quantity: inv.quantity || "",
  uom: inv.uom || "",
  vendorName: inv.vendor_name || "",
  poNumber: inv.purchase_order_number || "",
  poDate: inv.purchase_order_date?.substring(0, 10) || "",
  invoiceNumber: inv.invoice_number || "",
  invoiceDate: inv.invoice_date?.substring(0, 10) || "",
  invoiceValue: inv.invoice_value || "",
  taxableValue: inv.taxable_value || "",
  igst: inv.igst || "",
  cgst: inv.cgst || "",
  sgst: inv.sgst || "",
  billHanded: inv.bill_handed_over_to || "",
  allocationDate: inv.allocation_date?.substring(0, 10) || "",
  fixedAssetNumber: inv.fixed_asset_number || "",
  userName: inv.user_name || "",
  useFrom: inv.use_from?.substring(0, 10) || "",
  useTo: inv.use_to?.substring(0, 10) || "",
  remarks: inv.remarks || "",
});

// =============== UI HELPERS ===============
const formatDisplayDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

// =============== MAIN COMPONENT ===============
function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  
  const pageSize = 500;

  // Fetch data
  const load = async (p = 1, q = "") => {
    try {
      const res = await axios.get(API, {
        params: { search: q, page: p, pageSize },
      });

      setInvoices(res.data.data || []);
    } catch (err) {
      console.error("Error loading invoices", err);
      alert("Error loading invoices");
    }
  };

  useEffect(() => {
    load(1, search);
  }, [search]);

  // =============== SAVE HANDLER ===============
  const saveInvoice = async () => {
    try {
      const payload = toBackend(form);

      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload);
        alert("Updated successfully");
      } else {
        await axios.post(API, payload);
        alert("Added successfully");
      }

      setOpen(false);
      load(1, search);
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed – Check backend logs!");
    }
  };

  // =============== EDIT HANDLER ===============
  const editInvoice = (inv) => {
    setEditingId(inv.sn);
    setForm(toForm(inv));
    setOpen(true);
  };

  // =============== DELETE ===============
  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      load(1, search);
    } catch (err) {
      console.error("DELETE failed", err);
      alert("Delete failed");
    }
  };

  // =============== DOWNLOAD EXCEL ===============
  const excelDate = (d) =>
    (new Date(d) - new Date(Date.UTC(1899, 11, 30))) / 86400000;

  const downloadExcel = () => {
    if (!invoices.length) return alert("No data");

    const headers = Object.keys(invoices[0]);
    const rows = invoices.map((r) => {
      const row = {};
      headers.forEach((h) => {
        if (h.includes("date")) {
          row[h] = r[h] ? excelDate(r[h].substring(0, 10)) : "";
        } else row[h] = r[h] ?? "";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "Invoice_Report.xlsx");
  };

  // =============== RENDER UI ===============
  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <AppBar position="sticky" sx={{ background: "#1565c0" }}>
        <Toolbar>
          <IconButton color="inherit" href="/dashboard">
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Invoice Manager
          </Typography>

          <Button color="inherit" onClick={downloadExcel} sx={{ mr: 2 }}>
            Download Excel
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setOpen(true);
            }}
            sx={{ borderColor: "#fff" }}
          >
            Add Invoice
          </Button>
        </Toolbar>
      </AppBar>

      <div style={{ padding: 20 }}>
        <TextField
          label="Search Invoice"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </div>

      <Paper style={{ margin: 20, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1565c0", color: "white" }}>
                <th>S/N</th>
                <th>Material</th>
                <th>Invoice No</th>
                <th>Indent Date</th>
                <th>Allocated</th>
                <th>User</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv, idx) => (
                <tr key={idx}>
                  <td>{inv.sn}</td>
                  <td>{inv.material}</td>
                  <td>{inv.invoice_number}</td>
                  <td>{formatDisplayDate(inv.indent_date)}</td>
                  <td>{formatDisplayDate(inv.allocation_date)}</td>
                  <td>{inv.user_name}</td>
                  <td>{inv.invoice_value}</td>
                  <td>
                    <Button size="small" onClick={() => editInvoice(inv)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => deleteInvoice(inv.sn)}
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

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Update Invoice" : "Add Invoice"}</DialogTitle>

        <DialogContent dividers>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 15,
            }}
          >
            {Object.keys(form).map((key) => (
              <TextField
                key={key}
                label={key}
                name={key}
                type={key.toLowerCase().includes("date") ? "date" : "text"}
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            ))}
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveInvoice}>
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default InvoiceManager;

