// src/pages/AssetDetails.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const AssetDetails = () => {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [editingAsset, setEditingAsset] = useState(null);
  const [newAsset, setNewAsset] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/asset-details");
      setAssets(res.data);
    } catch (err) {
      console.error("❌ Error fetching asset details:", err);
    }
  };

  // ---------- CRUD Operations ----------
  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleDelete = async (asset) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/asset-details/${asset["S/N"]}`);
      alert("Deleted successfully!");
      fetchAssets();
    } catch (err) {
      alert("Error deleting record: " + err.message);
    }
  };

  const handleSave = async () => {
    try {
      if (editingAsset) {
        // Update existing record
        await axios.put("http://localhost:5000/api/asset-details", editingAsset);
        alert("Record updated successfully!");
      } else {
        // Add new record
        await axios.post("http://localhost:5000/api/asset-details", newAsset);
        alert("New asset added!");
      }
      setShowModal(false);
      setEditingAsset(null);
      setNewAsset({});
      fetchAssets();
    } catch (err) {
      alert("Error saving record: " + err.message);
    }
  };

  // ---------- Export CSV ----------
  const exportToCSV = () => {
    const csvHeader = Object.keys(assets[0] || {}).join(",") + "\n";
    const csvRows = assets
      .map((row) => Object.values(row).map((v) => `"${v || ""}"`).join(","))
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
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

  const assetKeys = [
    "S/N",
    "Location",
    "Department",
    "Asset  Number",
    "User Name",
    "Make Model",
    "Serial Number",
    "Processor",
    "HDD",
    "RAM",
    "IP Address",
    "DOP #",
    "Printer",
    "Serial No",
    "F/A ",
    "DOP",
  ];

  return (
    <div style={styles.page}>
      {/* Header */}
<div style={styles.headerRow}>
  <div style={styles.titleRow}>
    <h1 style={styles.title}>💻 IT Asset Details</h1>
    <button
      style={styles.backBtn}
      onClick={() => (window.location.href = "/dashboard")}
    >
      ⬅ Back to Dashboard
    </button>

        <button
      style={styles.scrapBtn}
      onClick={() => (window.location.href = "/scrap-items")}
    >
      🧾 Scrap Items
    </button>
     <button
      style={styles.stockBtn}
      onClick={() => (window.location.href = "/stock-items")}
    >
      📦 Stock Items
    </button>
         <button
      style={styles.stockBtn}
      onClick={() => (window.location.href = "/asset-summary")}
    >
       Asset Summary
    </button>

  </div>

  <div style={styles.controls}>
    <input
      type="text"
      placeholder="Search any field..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={styles.searchInput}
    />
    <button style={styles.addBtn} onClick={() => setShowModal(true)}>
      ➕ Add
    </button>
    <button style={styles.exportBtn} onClick={exportToCSV}>
      ⬇ Export CSV
    </button>
  </div>
</div>

            {/* ✅ Record count */}
      <p className="text-sm text-gray-600 mb-2">
        Showing {filteredAssets.length} of {assets.length} records
      </p>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead style={styles.stickyHeader}>
            <tr>
              {assetKeys.map((header, i) => (
                <th key={i} style={{ ...styles.th, width: i === 0 ? 80 : "auto" }}>
                  {header}
                </th>
              ))}
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length > 0 ? (
              filteredAssets.map((a, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#fff" : "#f8fbff",
                    transition: "background-color 0.2s",
                  }}
                >
                  {assetKeys.map((k, j) => (
                    <td key={j} style={styles.td}>
                      {k === "DOP #"
                         ? a[k]
                          ? new Date(a[k]).toISOString().split("T")[0]
                           : ""
                        : a[k]}
                    </td>
                  ))}
                  <td style={styles.actionTd}>
                    <button style={styles.editBtn} onClick={() => handleEdit(a)}>
                      ✏ Edit
                    </button>
                    <button style={styles.delBtn} onClick={() => handleDelete(a)}>
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={assetKeys.length + 1} style={styles.emptyCell}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingAsset ? "✏ Edit Asset" : "➕ Add New Asset"}
            </h2>
            <div style={styles.modalContent}>
              {assetKeys.map((key, i) => (
                <div key={i} style={styles.formRow}>
                  <label style={styles.label}>{key}</label>
                  <input
                    style={styles.input}
                    value={
                      editingAsset
                        ? editingAsset[key] || ""
                        : newAsset[key] || ""
                    }
                    onChange={(e) => {
                      if (editingAsset) {
                        setEditingAsset({
                          ...editingAsset,
                          [key]: e.target.value,
                        });
                      } else {
                        setNewAsset({ ...newAsset, [key]: e.target.value });
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={styles.modalActions}>
              <button style={styles.saveBtn} onClick={handleSave}>
                💾 Save
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setShowModal(false);
                  setEditingAsset(null);
                  setNewAsset({});
                }}
              >
                ❌ Cancel
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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 24, color: "#0b4a8b", margin: 0 },
  controls: { display: "flex", gap: 8 },
  searchInput: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
  },
  addBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 12px",
    cursor: "pointer",
  },
  exportBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 12px",
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    maxHeight: "100vh",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    background: "linear-gradient(90deg,#e8f0ff,#d8eaff)",
    zIndex: 10,
  },
  th: {
    padding: "10px 8px",
    borderBottom: "1px solid #dbeafe",
    textAlign: "left",
    fontWeight: "bold",
    color: "#0b3b6a",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
  },
  actionTd: { padding: "8px 10px", display: "flex", gap: 6 },
  editBtn: {
    background: "#facc15",
    border: "none",
    padding: "4px 8px",
    borderRadius: 4,
    cursor: "pointer",
  },
  delBtn: {
    background: "#ef4444",
    border: "none",
    padding: "4px 8px",
    color: "#fff",
    borderRadius: 4,
    cursor: "pointer",
  },
  emptyCell: {
    textAlign: "center",
    padding: 20,
    color: "#6b7280",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "90vh",
    overflowY: "auto",
    zIndex: 101,
  },
  modalTitle: { marginTop: 0, color: "#0b4a8b" },
  modalContent: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  formRow: { display: "flex", flexDirection: "column" },
  label: { fontSize: 12, color: "#334155" },
  input: {
    padding: "6px 8px",
    border: "1px solid #cbd5e1",
    borderRadius: 4,
  },
  modalActions: { marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 },
  saveBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
  },
  cancelBtn: {
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
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

scrapBtn: {
  background: "#a70505ff",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "8px 12px",
  cursor: "pointer",
},
stockBtn: {
  background: "#257206ff",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "8px 12px",
  cursor: "pointer",
},

};

export default AssetDetails;
