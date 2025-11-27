// src/pages/AssetDetails.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const fieldMap = {
  "S/N": "sn",
  Location: "location",
  Department: "department",
  "Asset Number": "asset_number",
  "User Name": "user_name",
  "Make/Model": "make_model",
  "Serial Number": "serial_number",
  Processor: "processor",
  HDD: "hdd",
  RAM: "ram",
  "IP Address": "ip_address",
  "DOP Date": "dop_date",
  Printer: "printer",
  "Serial No": "serial_no",
  "F/A": "fa",
  "DOP Info": "dop_info",
};

const assetKeys = Object.keys(fieldMap);

const AssetDetails = () => {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [editingAsset, setEditingAsset] = useState(null);
  const [newAsset, setNewAsset] = useState({});
  const [showModal, setShowModal] = useState(false);

  // ✅ fetchAssets defined before useEffect
  const fetchAssets = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/asset-details`);
      setAssets(res.data.map(convertToUIDisplay));
    } catch (err) {
      console.error("❌ Error fetching asset details:", err);
    }
  }, []); // memoized so dependency doesn't change

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]); // ✅ include in dependency array

const convertToUIDisplay = (dbRecord) => {
  const uiRecord = {};
  assetKeys.forEach((label) => {
    let value = dbRecord[fieldMap[label]] || "";
    
    // Format DOP Date to YYYY-MM-DD
    if (label === "DOP Date" && value) {
      value = new Date(value).toISOString().split("T")[0];
    }

    uiRecord[label] = value;
  });
  return uiRecord;
};


  const convertToDBFormat = (uiRecord) => {
    const dbObj = {};
    Object.keys(uiRecord).forEach((label) => {
      dbObj[fieldMap[label]] = uiRecord[label];
    });
    return dbObj;
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleDelete = async (asset) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_URL}/asset-details/${asset["S/N"]}`);
      fetchAssets();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSave = async () => {
    try {
      const payload = editingAsset
        ? convertToDBFormat(editingAsset)
        : convertToDBFormat(newAsset);

      if (editingAsset) {
        await axios.put(`${API_URL}/asset-details`, payload);
      } else {
        await axios.post(`${API_URL}/asset-details`, payload);
      }

      setShowModal(false);
      setEditingAsset(null);
      setNewAsset({});
      fetchAssets();
    } catch (err) {
      alert("Save failed: " + err.message);
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const header = assetKeys.join(",") + "\n";
    const rows = assets
      .map((row) => assetKeys.map((k) => `"${row[k] || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Asset_Details.csv";
    link.click();
  };

  const filteredAssets = assets.filter((asset) =>
    Object.values(asset).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>💻 IT Asset Details</h1>
          <button style={styles.backBtn} onClick={() => (window.location.href = "/dashboard")}>
            ⬅ Back
          </button>
          <button style={styles.scrapBtn} onClick={() => (window.location.href = "/scrap-items")}>
            🧾 Scrap Items
          </button>
          <button style={styles.stockBtn} onClick={() => (window.location.href = "/stock-items")}>
            📦 Stock Items
          </button>
          <button style={styles.stockBtn} onClick={() => (window.location.href = "/asset-summary")}>
            📊 Asset Summary
          </button>
        </div>

        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button
            style={styles.addBtn}
            onClick={() => {
              const emptyForm = {};
              assetKeys.forEach((label) => (emptyForm[label] = ""));
              setNewAsset(emptyForm);
              setEditingAsset(null);
              setShowModal(true);
            }}
          >
            ➕ Add
          </button>
          <button style={styles.exportBtn} onClick={exportToCSV}>
            ⬇ CSV
          </button>
        </div>
      </div>

      <p style={{ marginBottom: 8 }}>
        Showing {filteredAssets.length} of {assets.length} records
      </p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead style={styles.stickyHeader}>
            <tr>
              {assetKeys.map((h, i) => (
                <th key={i} style={styles.th}>{h}</th>
              ))}
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((row, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                {assetKeys.map((k) => (
                  <td key={k} style={styles.td}>{row[k]}</td>
                ))}
                <td style={styles.actionTd}>
                  <button style={styles.editBtn} onClick={() => handleEdit(row)}>Edit</button>
                  <button style={styles.delBtn} onClick={() => handleDelete(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingAsset ? "Edit Asset" : "Add Asset"}
            </h2>

            <div style={styles.modalContent}>
              {assetKeys.map((label) => (
                <div style={styles.formRow} key={label}>
                  <label>{label}</label>
                  <input
                    type={label === "DOP Date" ? "date" : "text"} // ✅ Date picker for DOP Date
                    style={styles.input}
                    value={
                      editingAsset ? editingAsset[label] || "" : newAsset[label] || ""
                    }
                    onChange={(e) => {
                      if (editingAsset) {
                        setEditingAsset({
                          ...editingAsset,
                          [label]: e.target.value,
                        });
                      } else {
                        setNewAsset({
                          ...newAsset,
                          [label]: e.target.value,
                        });
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button style={styles.saveBtn} onClick={handleSave}>Save</button>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setShowModal(false);
                  setEditingAsset(null);
                  setNewAsset({});
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------- Styles -----------------------
const styles = {
  page: { background: "#f6f9fc", minHeight: "100vh", padding: 24 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  titleRow: { display: "flex", alignItems: "center", gap: 12 },
  title: { fontSize: 24, color: "#0b4a8b", margin: 0 },
  searchInput: { padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6 },
  controls: { display: "flex", gap: 10 },
  addBtn: { background: "#10b981", color: "#fff", padding: "8px 12px", borderRadius: 6, cursor: "pointer", border: "none" },
  exportBtn: { background: "#3b82f6", color: "#fff", padding: "8px 12px", borderRadius: 6, cursor: "pointer", border: "none" },
  backBtn: { background: "#2563eb", color: "#fff", padding: "6px 10px", borderRadius: 6, cursor: "pointer", border: "none" },
  scrapBtn: { background: "#b91c1c", color: "#fff", padding: "8px 12px", borderRadius: 6, cursor: "pointer", border: "none" },
  stockBtn: { background: "#15803d", color: "#fff", padding: "8px 12px", borderRadius: 6, cursor: "pointer", border: "none" },
  tableWrap: { marginTop: 12, background: "#fff", borderRadius: 8, overflowY: "auto", maxHeight: "500px" }, // ✅ Freeze table header
  table: { width: "100%", borderCollapse: "collapse" },
  stickyHeader: { position: "sticky", top: 0, background: "#e6f0ff", zIndex: 10 },
  th: { padding: 10, fontWeight: "bold", background: "#e8efff", borderBottom: "1px solid #cbd5e1" },
  td: { padding: 8, borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" },
  rowEven: { background: "#fff" },
  rowOdd: { background: "#f8fbff" },
  actionTd: { display: "flex", gap: 6 },
  editBtn: { background: "#facc15", padding: "4px 8px", borderRadius: 4, cursor: "pointer", border: "none" },
  delBtn: { background: "#ef4444", padding: "4px 8px", color: "#fff", borderRadius: 4, cursor: "pointer", border: "none" },
  modalBackdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: 24, borderRadius: 10, width: "80%", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { marginBottom: 10, color: "#0b4a8b", fontWeight: "bold" },
  modalContent: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formRow: { display: "flex", flexDirection: "column" },
  input: { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6 },
  modalActions: { marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 },
  saveBtn: { background: "#2563eb", color: "#fff", padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
  cancelBtn: { background: "#9ca3af", color: "#fff", padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
};

export default AssetDetails;
