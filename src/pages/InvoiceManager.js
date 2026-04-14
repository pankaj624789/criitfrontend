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

const API = "http://localhost:5000/api/invoices";

const emptyForm = {
  IndentDate: "",
  Material: "",
  Particular: "",
  Quantity: "",
  UOM: "",
  VendorName: "",
  PONumber: "",
  PODate: "",
  InvoiceNumber: "",
  InvoiceDate: "",
  InvoiceValue: "",
  TaxableValue: "",
  IGST: "",
  CGST: "",
  SGST: "",
  BillHanded: "",
  AllocationDate: "",
  FixedAssetNumber: "",
  UserName: "",
  UseFrom: "",
  UseTo: "",
  Remarks: "",
};

// Convert date to dd-mm-yyyy for UI table
const formatDisplayDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// Convert JS date string into Excel serial date
const excelDate = (jsDateStr) => {
  if (!jsDateStr) return null;
  return (
    (new Date(jsDateStr) - new Date(Date.UTC(1899, 11, 30))) / 86400000
  );
};

function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get(API, {
        params: { search, page: 1, pageSize: 500 },
      });
      setInvoices(res.data.data);
    } catch (err) {
      alert("Error loading invoices");
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  const saveInvoice = async () => {
    try {
      const payload = {
        "Indent Date": form.IndentDate,
        Material: form.Material,
        Particular: form.Particular,
        Quantity: form.Quantity,
        UOM: form.UOM,
        "Vendor Name": form.VendorName,
        "Purchase Order Number": form.PONumber,
        "Purchase Order Date": form.PODate,
        "Invoice Number": form.InvoiceNumber,
        "Invoice Date": form.InvoiceDate,
        "Invoice Value": form.InvoiceValue,
        "Taxable value": form.TaxableValue,
        IGST: form.IGST,
        CGST: form.CGST,
        SGST: form.SGST,
        "Bill Handed Over to": form.BillHanded,
        "Allocation Date": form.AllocationDate,
        "Fixed Asset Number": form.FixedAssetNumber,
        "User Name": form.UserName,
        "Use From": form.UseFrom,
        "Use To": form.UseTo,
        "Remarks ": form.Remarks,
      };

      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload);
        alert("Updated Successfully");
      } else {
        await axios.post(API, payload);
        alert("Added Successfully");
      }

      setOpen(false);
      load();
    } catch (err) {
      alert("Save Failed");
    }
  };

  const editInvoice = (inv) => {
    setEditingId(inv["S/N"]);
    setForm({
      IndentDate: inv["Indent Date"]?.substring(0, 10),
      Material: inv.Material,
      Particular: inv.Particular,
      Quantity: inv.Quantity,
      UOM: inv.UOM,
      VendorName: inv["Vendor Name"],
      PONumber: inv["Purchase Order Number"],
      PODate: inv["Purchase Order Date"]?.substring(0, 10),
      InvoiceNumber: inv["Invoice Number"],
      InvoiceDate: inv["Invoice Date"]?.substring(0, 10),
      InvoiceValue: inv["Invoice Value"],
      TaxableValue: inv["Taxable value"],
      IGST: inv.IGST,
      CGST: inv.CGST,
      SGST: inv.SGST,
      BillHanded: inv["Bill Handed Over to"],
      AllocationDate: inv["Allocation Date"]?.substring(0, 10),
      FixedAssetNumber: inv["Fixed Asset Number"],
      UserName: inv["User Name"],
      UseFrom: inv["Use From"]?.substring(0, 10),
      UseTo: inv["Use To"]?.substring(0, 10),
      Remarks: inv["Remarks "] || "",
    });
    setOpen(true);
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await axios.delete(`${API}/${id}`);
    load();
  };

  // --------------------------
  // DOWNLOAD EXCEL
  // --------------------------
  const downloadExcel = () => {
    if (!invoices.length) return alert("No data to download!");

    const allCols = new Set();
    invoices.forEach((inv) => Object.keys(inv).forEach((k) => allCols.add(k)));

    const orderedColumns = ["S/N", ...[...allCols].filter((x) => x !== "S/N")];

    const rows = invoices.map((inv) => {
      const row = {};
      orderedColumns.forEach((col) => {
        if (col.toLowerCase().includes("date")) {
          row[col] = excelDate(inv[col]?.substring(0, 10));
        } else {
          row[col] = inv[col] ?? "";
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows, { header: orderedColumns });

    // Format date columns
    const dateCols = orderedColumns.filter((c) => c.toLowerCase().includes("date"));
    dateCols.forEach((col) => {
      const colIndex = orderedColumns.indexOf(col);
      const colLetter = XLSX.utils.encode_col(colIndex);

      for (let r = 2; r <= rows.length + 1; r++) {
        const cellRef = `${colLetter}${r}`;
        const cell = ws[cellRef];
        if (cell && typeof cell.v === "number") {
          cell.t = "n";
          cell.z = "dd-mm-yyyy";
        }
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "Invoice_Report.xlsx");
  };

  const headerStyle = {
  padding: "12px 16px",
  fontWeight: "bold",
  fontSize: "13px",
  borderBottom: "1px solid #ccc",
};

const cellStyle = {
  padding: "10px 16px",
  fontSize: "14px",
  borderBottom: "1px solid #e0e0e0",
};


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
            onClick={openAddModal}
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

      <Paper
  elevation={0}
  style={{
    margin: 20,
    padding: 0,
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid #e0e0e0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  }}
>
  <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
    <table
      className="invoiceTable"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Arial",
      }}
    >
      <thead>
        <tr
          style={{
            background: "#1565c0",
            color: "white",
            position: "sticky",
            top: 0,
            zIndex: 2,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <th style={headerStyle}>S/N</th>
          <th style={headerStyle}>Material</th>
          <th style={headerStyle}>Invoice No</th>
          <th style={headerStyle}>Indent Date</th>
          <th style={headerStyle}>Allocated On</th>
          <th style={headerStyle}>User</th>
          <th style={headerStyle}>Value</th>
          <th style={headerStyle}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {invoices.map((inv, i) => (
          <tr
            key={inv["S/N"]}
            style={{
              background: i % 2 === 0 ? "#fafafa" : "white",
              transition: "0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e3f2fd";
              e.currentTarget.style.transform = "scale(1.005)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = i % 2 === 0 ? "#fafafa" : "white";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <td style={cellStyle}>{inv["S/N"]}</td>
            <td style={cellStyle}>{inv.Material}</td>
            <td style={cellStyle}>{inv["Invoice Number"]}</td>
            <td style={cellStyle}>{formatDisplayDate(inv["Indent Date"])}</td>
            <td style={cellStyle}>{formatDisplayDate(inv["Allocation Date"])}</td>
            <td style={cellStyle}>{inv["User Name"]}</td>
            <td style={cellStyle}>{inv["Invoice Value"]}</td>
            <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
              <Button size="small" onClick={() => editInvoice(inv)}>
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => deleteInvoice(inv["S/N"])}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }}>
            {Object.keys(emptyForm).map((key) => (
              <TextField
                key={key}
                label={key}
                name={key}
                type={key.toLowerCase().includes("date") ? "date" : "text"}
                value={form[key] || ""}
                onChange={handleChange}
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

