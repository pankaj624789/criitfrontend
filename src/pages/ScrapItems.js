import React, { useEffect, useState } from "react";
import axios from "axios";

const ScrapItems = () => {
  const [scraps, setScraps] = useState([]);
  const [search, setSearch] = useState("");
  const [formScrap, setFormScrap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchScraps();
  }, []);

  const fetchScraps = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/scrap-items");
      setScraps(res.data);
    } catch (err) {
      console.error("❌ Error fetching scrap items:", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:5000/api/scrap-items", formScrap);
      alert("✅ New scrap item added!");
      setShowModal(false);
      setFormScrap({});
      fetchScraps();
    } catch (err) {
      alert("❌ Error adding scrap item: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item from scrap list?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/scrap-items/${id}`);
      fetchScraps();
    } catch (err) {
      alert("❌ Error deleting scrap item: " + err.message);
    }
  };

  const handleEdit = (item) => {
    setFormScrap(item);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put("http://localhost:5000/api/scrap-items", formScrap);
      alert("✅ Scrap item updated successfully!");
      setShowModal(false);
      setFormScrap({});
      setIsEditing(false);
      fetchScraps();
    } catch (err) {
      alert("❌ Error updating scrap item: " + err.message);
    }
  };

  const scrapKeys = [
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
    "Status",
    "DOP #",
    "Scrap Date",
  ];

  const filteredScraps = scraps.filter((s) =>
    Object.values(s).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>🗑 Scrap Items</h1>
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
              setFormScrap({});
              setIsEditing(false);
              setShowModal(true);
            }}
          >
            ➕ Add Scrap Item
          </button>
          <button
            style={styles.backBtn}
            onClick={() => (window.location.href = "/asset-details")}
          >
            ⬅ Back to Asset
          </button>
        </div>
      </div>

      <p style={styles.count}>
        Showing {filteredScraps.length} of {scraps.length} records
      </p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              {scrapKeys.map((k, i) => (
                <th key={i} style={styles.th}>
                  {k}
                </th>
              ))}
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredScraps.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? "#f8fbff" : "#fff" }}>
                {scrapKeys.map((k, j) => (
                  <td key={j} style={styles.td}>
                    {k === "DOP #" || k === "Scrap Date"
                      ? r[k]
                        ? new Date(r[k]).toLocaleDateString()
                        : ""
                      : r[k]}
                  </td>
                ))}
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(r)}>
                    ✏️
                  </button>
                  <button style={styles.delBtn} onClick={() => handleDelete(r["S/N"])}>
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {isEditing ? "✏️ Edit Scrap Item" : "➕ Add Scrap Item"}
            </h3>
            <div style={styles.modalContent}>
              {/* ✅ S/N is auto-generated, so skip input on Add */}
              {scrapKeys
                .filter((k) => k !== "S/N")
                .map((k, i) => (
                  <div key={i} style={styles.formRow}>
                    <label style={styles.label}>{k}</label>
                    <input
                      style={styles.input}
                      value={formScrap[k] || ""}
                      onChange={(e) =>
                        setFormScrap({ ...formScrap, [k]: e.target.value })
                      }
                    />
                  </div>
                ))}
            </div>
            <div style={styles.modalActions}>
              <button
                style={styles.saveBtn}
                onClick={isEditing ? handleUpdate : handleAdd}
              >
                💾 {isEditing ? "Update" : "Save"}
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setFormScrap({});
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

const styles = {
  page: { background: "#f6f9fc", minHeight: "100vh", padding: 20 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#0b4a8b" },
  controls: { display: "flex", gap: 8 },
  searchInput: { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6 },
  addBtn: { background: "#10b981", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6 },
  backBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6 },
  tableWrap: { marginTop: 10, overflowX: "auto", background: "#fff", borderRadius: 8 },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#e8f0ff", position: "sticky", top: 0 },
  th: { textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #ccc" },
  td: { padding: "6px 10px", borderBottom: "1px solid #eee" },
  editBtn: { background: "#fbbf24", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", padding: "4px 8px", marginRight: 4 },
  delBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", padding: "4px 8px" },
  modalBackdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "#fff", borderRadius: 10, padding: 20, width: "80%", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { margin: 0, color: "#0b4a8b" },
  modalContent: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 },
  formRow: { display: "flex", flexDirection: "column" },
  label: { fontSize: 12, color: "#555" },
  input: { padding: "6px 8px", border: "1px solid #ccc", borderRadius: 4 },
  modalActions: { marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 8 },
  saveBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "8px 12px" },
  cancelBtn: { background: "#9ca3af", color: "#fff", border: "none", borderRadius: 6, padding: "8px 12px" },
  count: { fontSize: 12, color: "#555" },
};

export default ScrapItems;
