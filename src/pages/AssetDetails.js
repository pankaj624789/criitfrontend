import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const fieldMap = {
  "S/N": "sn",
  Location: "location",
  User: "user_name",
  "Asset Number": "asset_number",
  "Department": "department",
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

/* 🔒 column widths for freezing */
const COL_WIDTH = {
  "S/N": 50,
  Location: 120,
  User: 160,
};

const AssetDetails = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [editingAsset, setEditingAsset] = useState(null);
  const [newAsset, setNewAsset] = useState({});
  const [showModal, setShowModal] = useState(false);

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

  /* ================= DATA ================= */

  const convertToUIDisplay = (dbRecord) => {
    const ui = {};
    assetKeys.forEach((label) => {
      let value = dbRecord[fieldMap[label]] || "";
      if (label === "DOP Date" && value) {
        value = new Date(value).toISOString().split("T")[0];
      }
      ui[label] = value;
    });
    return ui;
  };

  const convertToDBFormat = (ui) => {
    const db = {};
    Object.keys(ui).forEach((k) => (db[fieldMap[k]] = ui[k]));
    return db;
  };

  const fetchAssets = useCallback(async () => {
    const res = await axios.get(`${API_URL}/asset-details`);
    setAssets(res.data.map(convertToUIDisplay));
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  /* ================= ACTIONS ================= */

  const handleEdit = (asset) => {
    setEditingAsset({ ...asset });
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

    editingAsset
      ? await axios.put(`${API_URL}/asset-details`, payload)
      : await axios.post(`${API_URL}/asset-details`, payload);

    setShowModal(false);
    setEditingAsset(null);
    setNewAsset({});
    fetchAssets();
  };

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

  const saveAllotment = async () => {
    await axios.post(`${API_URL}/asset-allotment`, {
      asset_sn: selectedAsset["S/N"],
      ...allotData,
    });
    setShowAllotModal(false);
    alert("Asset item allotted successfully");
  };

  const filteredAssets = assets.filter((a) =>
    Object.values(a).some((v) =>
      v?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  /* ================= FREEZE STYLE ================= */

  const stickyStyle = (index, isHeader = false) => {
    if (index === 0)
      return {
        position: "sticky",
        left: 0,
        zIndex: isHeader ? 20 : 10,
        background: "#97f0f0ff",
        width: COL_WIDTH["S/N"],
      };
    if (index === 1)
      return {
        position: "sticky",
        left: COL_WIDTH["S/N"],
        zIndex: isHeader ? 20 : 10,
        background: "#97f0f0ff",
        width: COL_WIDTH["Location"],
      };
    if (index === 2)
      return {
        position: "sticky",
        left: COL_WIDTH["S/N"] + COL_WIDTH["Location"],
        zIndex: isHeader ? 20 : 10,
        background: "#97f0f0ff",
        width: COL_WIDTH["Department"],
      };
    return {};
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.headerRow}>
        <h1 style={styles.title}>💻 IT Asset Details</h1>

        <div style={styles.controls}>
          <button style={{ ...styles.addBtn, background: "#3b82f6" }} onClick={() => navigate("/dashboard")}>
            🏠 Dashboard
          </button>
          <button style={{ ...styles.addBtn, background: "#055745ff" }} onClick={() => navigate("/user-allotments")}>
            👤 User Allotments
          </button>

          <input
            style={styles.searchInput}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            style={styles.addBtn}
            onClick={() => {
              const empty = {};
              assetKeys.forEach((k) => (empty[k] = ""));
              setNewAsset(empty);
              setEditingAsset(null);
              setShowModal(true);
            }}
          >
            ➕ Add
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead style={styles.stickyHeader}>
            <tr>
              {assetKeys.map((h, i) => (
                <th key={h} style={{ ...styles.th, ...stickyStyle(i, true) }}>
                  {h}
                </th>
              ))}
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAssets.map((row, r) => (
              <tr key={r}>
                {assetKeys.map((k, i) => (
                  <td key={k} style={{ ...styles.td, ...stickyStyle(i) }}>
                    {row[k]}
                  </td>
                ))}
                <td style={styles.actionTd}>
                  <button style={styles.editBtn} onClick={() => handleEdit(row)}>Edit</button>
                  <button style={styles.delBtn} onClick={() => handleDelete(row)}>Delete</button>
                  <button style={{ ...styles.editBtn, background: "#22c55e" }} onClick={() => openAllotModal(row)}>
                    Allot
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingAsset ? "Edit Asset" : "Add Asset"}</h2>

            {assetKeys.map((label) => (
              <div style={styles.formRow} key={label}>
                <label>{label}</label>
                <input
                  style={styles.input}
                  value={(editingAsset || newAsset)[label] || ""}
                  onChange={(e) =>
                    editingAsset
                      ? setEditingAsset({ ...editingAsset, [label]: e.target.value })
                      : setNewAsset({ ...newAsset, [label]: e.target.value })
                  }
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

      {/* ALLOT MODAL */}
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
            ].map(([f, disabled]) => (
              <div style={styles.formRow} key={f}>
                <label>{f.replace(/_/g, " ").toUpperCase()}</label>
                <input
                  style={styles.input}
                  disabled={disabled}
                  type={f === "quantity" ? "number" : "text"}
                  value={allotData[f]}
                  onChange={(e) => setAllotData({ ...allotData, [f]: e.target.value })}
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

/* ================= STYLES ================= */

const styles = {
  page: { background: "#bad6f1ff", minHeight: "100vh", padding: 24 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, color: "#0b4a8b", margin: 0 },
  searchInput: { padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc" },
  controls: { display: "flex", gap: 10 },
  addBtn: { background: "#10b981", color: "#fff", padding: "8px 12px", borderRadius: 6, border: "none" },

  tableWrap: { marginTop: 12, background: "#fff", borderRadius: 8, overflow: "auto", maxHeight: 555 },
  table: { borderCollapse: "collapse", width: "max-content" },
  stickyHeader: { position: "sticky", top: 0, zIndex: 15 },
  th: { padding: 10, background: "#b0c6faff", borderBottom: "1px solid #1a232eff", whiteSpace: "nowrap" },
  td: { padding: 8, borderBottom: "1px solid #71a3afff", whiteSpace: "nowrap" },

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
    zIndex: 100,
  },
  modal: {
    background: "#fff",
    padding: 24,
    borderRadius: 10,
    width: "30%",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalTitle: { marginBottom: 10, color: "#0b4a8b" },
  formRow: { display: "flex", flexDirection: "column", marginBottom: 10 },
  input: { padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  saveBtn: { background: "#2563eb", color: "#fff", padding: "8px 12px", borderRadius: 6, border: "none" },
  cancelBtn: { background: "#9ca3af", color: "#fff", padding: "8px 12px", borderRadius: 6, border: "none" },
};

export default AssetDetails;
