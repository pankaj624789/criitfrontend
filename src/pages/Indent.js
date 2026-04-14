import React, { useEffect, useState } from "react";
import axios from "axios";

const Indent = () => {
  const [indents, setIndents] = useState([]);
  const [formData, setFormData] = useState({
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
  });

  // Fetch all indents when component loads
  useEffect(() => {
    fetchIndents();
  }, []);

  const fetchIndents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/indents");
      setIndents(res.data);
    } catch (err) {
      console.error("❌ Error fetching indents:", err);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/indents", formData);
      alert("✅ Indent added successfully!");

      // Reset form
      setFormData({
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
      });

      // Refresh the table
      fetchIndents();
    } catch (err) {
      console.error("❌ Error adding indent:", err);
      alert("❌ Failed to add indent. Please check the console for details.");
    }
  };

  return (
   <div style={styles.headerRow}>
  <div style={styles.headerLeft}>
    <h1 style={styles.title}>Indent Section</h1>
    <button
      style={styles.backBtn}
      onClick={() => (window.location.href = "/dashboard")}
    >
      ⬅ Back to Dashboard
    </button>
  </div>


     
      {/* ---- Form ---- */}
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
          ➕ Add Indent
        </button>
      </form>

      {/* ---- Table ---- */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
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
                "Remarks/Drawing No.",
                "Required By",
                "Store Manager",
                "Reviewed By",
              ].map((head, index) => (
                <th key={index} style={styles.th}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indents.map((item) => (
              <tr key={item.Id}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- Styles ----
const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#0d47a1",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "40px",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
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
    transition: "background 0.2s",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    borderRadius: "8px",
  },
  th: {
    background: "#1976d2",
    color: "#fff",
    padding: "10px",
    textAlign: "center",
    borderBottom: "2px solid #1565c0",
  },
  td: {
    padding: "8px",
    textAlign: "center",
    borderBottom: "1px solid #ccc",
    fontSize: "14px",
  },
    titleRow: {
  display: "flex",
  alignItems: "center",
  gap: 12,
},
backBtn: {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 13,
},

};

export default Indent;
