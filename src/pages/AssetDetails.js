import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [editingAsset, setEditingAsset] = useState(null);
  const [newAsset, setNewAsset] = useState({});
  const [showModal, setShowModal] = useState(false);

  // 🔹 Allotment
  const [showAllotModal, setShowAllotModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [allotData, setAllotData] = useState({
    user_name: "",
    department: "",
    location: "",
    item_name: "",
    item_make: "",
    item_serial_no: "",
    quantity: 1,
    remarks: "",
  });

  const fetchAssets = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/asset-details`);
      setAssets(res.data.map(convertToUIDisplay));
    } catch (err) {
      console.error("❌ Error fetching asset details:", err);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const convertToUIDisplay = (dbRecord) => {
    const uiRecord = {};
    assetKeys.forEach((label) => {
      let value = dbRecord[fieldMap[label]] || "";
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

  // 🔹 Edit asset
  const handleEdit = (asset) => {
    setEditingAsset({ ...asset }); // clone to prevent mutation
    setShowModal(true);
  };

  const handleDelete = async (asset) => {
    if (!window.confirm("Delete this record?")) return;
    await axios.delete(`${API_URL}/asset-details/${asset["S/N"]}`);
    fetchAssets();
  };

  const handleSave = async () => {
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
  };

  // 🔹 Open allot modal (AUTO PREFILL)
  const openAllotModal = (asset) => {
    setSelectedAsset(asset);
    setAllotData({
      user_name: asset["User Name"] || "",
      department: asset["Department"] || "",
      location: asset["Location"] || "",
      item_name: "",
      item_make: "",
      item_serial_no: "",
      quantity: 1,
      remarks: "",
    });
    setShowAllotModal(true);
  };

  // 🔹 Save allotment
  const saveAllotment = async () => {
    await axios.post(`${API_URL}/asset-allotment`, {
      asset_sn: selectedAsset["S/N"],
      ...allotData,
    });

    setShowAllotModal(false);
    alert("Asset item allotted successfully");
  };

  const filteredAssets = assets.filter((asset) =>
    Object.values(asset).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={styles.page}>
      {/* 🔹 HEADER */}
      <div style={styles.headerRow}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>💻 IT Asset Details</h1>
        </div>

        <div style={styles.controls}>
          {/* 🔹 NAV BUTTONS */}
          <button
            style={{ ...styles.addBtn, background: "#3b82f6" }}
            onClick={() => navigate("/dashboard")}
          >
            🏠 Dashboard
          </button>
          <button
            style={{ ...styles.addBtn, background: "#f97316" }}
            onClick={() => navigate("/user-allotments")}
          >
            👤 User Allotments
          </button>

          {/* 🔹 Search & Add Asset */}
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
        </div>
      </div>

      {/* 🔹 ASSET TABLE */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead style={styles.stickyHeader}>
            <tr>
              {assetKeys.map((h) => (
                <th key={h} style={styles.th}>{h}</th>
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
                  <button
                    style={{ ...styles.editBtn, background: "#22c55e" }}
                    onClick={() => openAllotModal(row)}
                  >
                    Allot
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 ADD / EDIT MODAL */}
      {showModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingAsset ? "Edit Asset" : "Add Asset"}</h2>

            {assetKeys.map((label) => (
              <div style={styles.formRow} key={label}>
                <label>{label}</label>
                <input
                  style={styles.input}
                  type="text"
                  value={(editingAsset ? editingAsset[label] : newAsset[label]) || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editingAsset) {
                      setEditingAsset({ ...editingAsset, [label]: value });
                    } else {
                      setNewAsset({ ...newAsset, [label]: value });
                    }
                  }}
                />
              </div>
            ))}

            <div style={styles.modalActions}>
              <button style={styles.saveBtn} onClick={handleSave}>Save</button>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 ALLOTMENT MODAL */}
      {showAllotModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Allot Other Item</h2>

            {[
              ["user_name", true],
              ["department", true],
              ["location", true],
              ["item_name", false],
              ["item_make", false],
              ["item_serial_no", false],
              ["quantity", false],
              ["remarks", false],
            ].map(([field, disabled]) => (
              <div style={styles.formRow} key={field}>
                <label>{field.replace(/_/g, " ").toUpperCase()}</label>
                <input
                  style={styles.input}
                  disabled={disabled}
                  type={field === "quantity" ? "number" : "text"}
                  value={allotData[field]}
                  onChange={(e) =>
                    setAllotData({ ...allotData, [field]: e.target.value })
                  }
                />
              </div>
            ))}

            <div style={styles.modalActions}>
              <button style={styles.saveBtn} onClick={saveAllotment}>Allot</button>
              <button style={styles.cancelBtn} onClick={() => setShowAllotModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🔹 STYLES
const styles = {
  page: { background: "#f6f9fc", minHeight: "100vh", padding: 24 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  titleRow: { display: "flex", alignItems: "center", gap: 12 },
  title: { fontSize: 24, color: "#0b4a8b", margin: 0 },
  searchInput: { padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6 },
  controls: { display: "flex", gap: 10 },
  addBtn: { background: "#10b981", color: "#fff", padding: "8px 12px", borderRadius: 6, border: "none" },
  tableWrap: { marginTop: 12, background: "#fff", borderRadius: 8, overflowY: "auto", maxHeight: "500px" },
  table: { width: "100%", borderCollapse: "collapse" },
  stickyHeader: { position: "sticky", top: 0, background: "#e6f0ff", zIndex: 10 },
  th: { padding: 10, background: "#e8efff", borderBottom: "1px solid #cbd5e1" },
  td: { padding: 8, borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" },
  rowEven: { background: "#fff" },
  rowOdd: { background: "#f8fbff" },
  actionTd: { display: "flex", gap: 6 },
  editBtn: { background: "#facc15", padding: "4px 8px", borderRadius: 4, border: "none" },
  delBtn: { background: "#ef4444", padding: "4px 8px", color: "#fff", borderRadius: 4, border: "none" },
  modalBackdrop: { 
    position: "fixed", 
    inset: 0, 
    background: "rgba(0,0,0,0.5)", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 100 
  },
  modal: { 
    background: "#fff", 
    padding: 24, 
    borderRadius: 10, 
    width: "30%", 
    maxHeight: "80vh", 
    overflowY: "auto",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    zIndex: 101
  },
  modalTitle: { marginBottom: 10, color: "#0b4a8b" },
  formRow: { display: "flex", flexDirection: "column", marginBottom: 10 },
  input: { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  saveBtn: { background: "#2563eb", color: "#fff", padding: "8px 12px", borderRadius: 6, border: "none" },
  cancelBtn: { background: "#9ca3af", color: "#fff", padding: "8px 12px", borderRadius: 6, border: "none" },
};

export default AssetDetails;
