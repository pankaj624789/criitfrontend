import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import bg from "../assets/bg.png";


const API_URL = process.env.REACT_APP_API_URL;
const API = `${API_URL}/indents`;

const Indent = () => {
  const [indents, setIndents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedForPrint, setSelectedForPrint] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const initialFormData = {
    DescriptionOfMaterial: "",
    ReqQty: "",
    PendingQty: "",
    UOM: "",
    PresentStock: "",
    AVMC_Last3Months: "",
    MaxCons_Last1Year: "",
    RequiredDate: "",
    RemarksOrDrawingNo: "",
    RequiredBy: "",
    StoreManager: "",
    ReviewedBy: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  // ------------------- Fetch Indents -------------------
  useEffect(() => {
    fetchIndents();
  }, []);

  const fetchIndents = async () => {
    try {
      const res = await axios.get(API);
      setIndents(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching indents:", err);
      alert("Failed to fetch indents.");
    }
  };

  // ------------------- Handle Form Change -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------- Handle Add / Update -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, formData);
        alert("✅ Indent updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(API, formData);
        alert("✅ Indent added successfully!");
      }
      setFormData(initialFormData);
      fetchIndents();
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert("❌ Failed! Check console.");
    }
  };

  // ------------------- Handle Edit -------------------
  const handleEdit = (item) => {
    setEditingId(item.Id);
    setFormData({
      DescriptionOfMaterial: item.DescriptionOfMaterial,
      ReqQty: item.ReqQty,
      PendingQty: item.PendingQty,
      UOM: item.UOM,
      PresentStock: item.PresentStock,
      AVMC_Last3Months: item.AVMC_Last3Months,
      MaxCons_Last1Year: item.MaxCons_Last1Year,
      RequiredDate: item.RequiredDate?.split("T")[0] || "",
      RemarksOrDrawingNo: item.RemarksOrDrawingNo,
      RequiredBy: item.RequiredBy,
      StoreManager: item.StoreManager,
      ReviewedBy: item.ReviewedBy,
    });
  };

  // ------------------- Handle Delete -------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this indent?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      alert("🗑️ Deleted successfully!");
      fetchIndents();
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("❌ Failed to delete");
    }
  };

  // ------------------- Handle Checkbox -------------------
  const handleCheckboxChange = (id) => {
    setSelectedForPrint((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ------------------- Preview and PDF -------------------
  const handlePreview = () => {
    if (!selectedForPrint.length) {
      alert("Please select at least one indent for preview.");
      return;
    }
    setShowPreview(true);
  };

const downloadPDF = async () => {
  const input = document.getElementById("pdfContent");
  if (!input) {
    console.error("PDF div not found");
    return;
  }

  html2canvas(input)
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("Indents.pdf");
    })
    .catch((err) => console.error(err));
};

const today = new Date().toLocaleDateString();

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Indent Section</h1>
          <button
            style={styles.backBtn}
            onClick={() => (window.location.href = "/dashboard")}
          >
            ⬅ Back to Dashboard
          </button>
        </div>
        <button
          style={{ ...styles.button, background: "#4caf50", width: 150 }}
          onClick={handlePreview}
        >
          🖨️ Print Selected
        </button>
      </header>

      {/* Form */}
      <form style={styles.form} onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <input
            key={key}
            name={key}
            type={key.includes("Date") ? "date" : "text"}
            placeholder={key.replace(/([A-Z])/g, " $1")}
            value={formData[key]}
            onChange={handleChange}
            style={styles.input}
            required
          />
        ))}
        <button type="submit" style={styles.button}>
          {editingId ? "✏️ Update Indent" : "➕ Add Indent"}
        </button>
      </form>

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Select</th>
              {[
                "ID",
                "Requisition No",
                "Description",
                "Req Qty",
                "Pending Qty",
                "UOM",
                "Present Stock",
                "AVMC (Last 3 Months)",
                "Max Cons (Last 1 Year)",
                "Required Date",
                "Remarks",
                "Required By",
                "Store Manager",
                "Reviewed By",
                "Actions",
              ].map((head, index) => (
                <th key={index} style={styles.th}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indents.map((item) => (
              <tr key={item.Id} style={styles.tr}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selectedForPrint.includes(item.Id)}
                    onChange={() => handleCheckboxChange(item.Id)}
                  />
                </td>
                <td style={styles.td}>{item.Id}</td>
                <td style={styles.td}>{item.Requisition_No}</td>
                <td style={styles.td}>{item.DescriptionOfMaterial}</td>
                <td style={styles.td}>{item.ReqQty}</td>
                <td style={styles.td}>{item.PendingQty}</td>
                <td style={styles.td}>{item.UOM}</td>
                <td style={styles.td}>{item.PresentStock}</td>
                <td style={styles.td}>{item.AVMC_Last3Months}</td>
                <td style={styles.td}>{item.MaxCons_Last1Year}</td>
                <td style={styles.td}>
                  {item.RequiredDate
                    ? new Date(item.RequiredDate).toLocaleDateString()
                    : ""}
                </td>
                <td style={styles.td}>{item.RemarksOrDrawingNo}</td>
                <td style={styles.td}>{item.RequiredBy}</td>
                <td style={styles.td}>{item.StoreManager}</td>
                <td style={styles.td}>{item.ReviewedBy}</td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => handleEdit(item)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(item.Id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 10000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              maxHeight: "90%",
              overflowY: "auto",
              width: "90%",
            }}
          >
            <h3>Preview Selected Indents</h3>
            
<div id="pdfContent" style={{ background: "#fff", padding: 20, position:"relative" }}>

  {/* TOP RIGHT IMAGE */}
  <img
    src={bg}
    alt="Logo"
    style={{
      width: 80,
      position: "absolute",
      top: 10,
      right: 10,
    }}
  />

  <div style={{ textAlign: "center", marginBottom: 40 }}>
    <h2 style={{ margin: 0 }}>CRI LIMITED</h2>
    <h3 style={{ margin: 0 }}>PURCHASE INDENT</h3>
    <p>Date: {today}</p>
  </div>


  {indents
    .filter((i) => selectedForPrint.includes(i.Id))
    .map((indent, idx) => (
      <div key={idx} style={{ marginBottom: 20 }}>
        
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 10,
          }}
        >

                      <thead>
                        <tr>
                          {[
                            "Requisition No",
                            "Requested By",
                            "Item & Description",
                            "Code / Part No",
                            "Qty",
                            "UOM",
                            "Required By Date",
                            "Estimated Consumption",
                            "Avg.Monthly Consumption",
                            "Max Consumption in Last 1 Year",
                          ].map((col) => (
                            <th
                              key={col}
                              style={{
                                border: "1px solid #000",
                                padding: 5,
                                background: "#ddd",
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.Requisition_No}
                          </td>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.RequiredBy}
                          </td>
                           <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.DescriptionOfMaterial}
                          </td>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.RemarksOrDrawingNo || "-"}
                          </td>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.ReqQty}
                          </td>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.UOM}
                          </td>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.RequiredDate
                              ? new Date(indent.RequiredDate).toLocaleDateString()
                              : ""}
                          </td>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.PresentStock || "-"}
                          </td>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.AVMC_Last3Months || "-"}
                          </td>
                          <td style={{ border: "1px solid #000", padding: 8 }}>
                            {indent.MaxCons_Last1Year || "-"}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{ border: "1px solid #000", padding: 16 }}
                            colSpan={4}
                          >
                            <strong>ReviewedBy Signature:</strong>
                          </td>
                          <td
                            style={{ border: "1px solid #000", padding: 16 }}
                            colSpan={4}
                          >
                            <strong>CEO Signature:</strong>
                          </td>
                          <td
                            style={{ border: "1px solid #000", padding: 16 }}
                            colSpan={3}
                          >
                            <strong>MD Signature:</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>
            <button
              style={{
                marginTop: 10,
                padding: 10,
                background: "#4caf50",
                color: "#fff",
              }}
              onClick={downloadPDF}
            >
              Download PDF
            </button>
            <button
              style={{ marginLeft: 10, padding: 10 }}
              onClick={() => setShowPreview(false)}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Styles ----
const styles = {
  container: { padding: "20px", fontFamily: "Segoe UI", background: "#f4f6f8" },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "linear-gradient(90deg, #1976d2, #42a5f5)",
    padding: "15px 20px",
    color: "#fff",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "0 0 12px 12px",
    marginBottom: 20,
  },
  title: { margin: 0, fontSize: "1.8rem", fontWeight: 600 },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    transition: "0.2s",
  },
  button: {
    gridColumn: "1 / -1",
    padding: "12px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "0.3s",
  },
  tableContainer: { overflowX: "auto", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#1976d2", color: "#fff", padding: "12px", position: "sticky", top: 0, zIndex: 500, textAlign: "left" },
  td: { padding: "10px", borderBottom: "1px solid #eee", verticalAlign: "middle" },
  tr: { transition: "background 0.2s" },
  editBtn: { marginRight: "8px", padding: "6px 12px", background: "#ffb300", color: "#000", border: "none", cursor: "pointer", borderRadius: "6px", transition: "0.2s" },
  deleteBtn: { padding: "6px 12px", background: "#d32f2f", color: "#fff", border: "none", cursor: "pointer", borderRadius: "6px", transition: "0.2s" },
  backBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13 },
  headerLeft: { display: "flex", alignItems: "center", gap: 15 },
};

export default Indent;
