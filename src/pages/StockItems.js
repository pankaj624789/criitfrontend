import React, { useEffect, useState } from "react";
import axios from "axios";

const StockItems = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [formItem, setFormItem] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stock-items");
      const formatted = res.data.map((item) => ({
        ...item,
        "DOP #": item["DOP #"]
          ? new Date(item["DOP #"]).toLocaleDateString("en-GB")
          : "",
      }));
      setItems(formatted);
    } catch (err) {
      console.error("❌ Error fetching stock items:", err);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/stock-items/${row["S/N"]}`);
      alert("Deleted successfully!");
      fetchItems();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

const handleSave = async () => {
  try {
    let newItem = { ...formItem };

    if (!isEditing) {
      // ❗ ADD MODE → Remove S/N so backend does not receive it
      delete newItem["S/N"];
    }
    // EDIT MODE → Keep S/N (required for update)

    if (isEditing) {
      await axios.put("http://localhost:5000/api/stock-items", newItem);
      alert("✅ Item updated successfully!");
    } else {
      await axios.post("http://localhost:5000/api/stock-items", newItem);
      alert("✅ New item added!");
    }

    setFormItem({});
    setShowModal(false);
    setIsEditing(false);
    fetchItems();
  } catch (err) {
    alert("❌ Error saving: " + err.response?.data || err.message);
  }
};



  const handleEdit = (row) => {
    setFormItem(row);
    setIsEditing(true);
    setShowModal(true);
  };

  const keys = [
    "S/N",
    "Department",
    "Asset  Number",
    "User Name",
    "Item Type",
    "Make Model",
    "Serial Number",
    "Processor",
    "HDD",
    "RAM",
    "Status",
    "DOP #",
  ];

  const filtered = items.filter((i) =>
    Object.values(i).some((v) =>
      v?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>📦 Stock Items</h1>
        <div style={styles.controls}>
          <input
            style={styles.searchInput}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            style={styles.addBtn}
            onClick={() => {
              setFormItem({});
              setIsEditing(false);
              setShowModal(true);
            }}
          >
            ➕ Add
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
        Showing {filtered.length} of {items.length} records
      </p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              {keys.map((k, i) => (
                <th key={i} style={styles.th}>
                  {k}
                </th>
              ))}
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? "#f8fbff" : "#fff" }}>
                {keys.map((k, j) => (
                  <td key={j} style={styles.td}>
                    {r[k]}
                  </td>
                ))}
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => handleEdit(r)}
                  >
                    ✏️
                  </button>
                  <button
                    style={styles.delBtn}
                    onClick={() => handleDelete(r)}
                  >
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
              {isEditing ? "✏️ Edit Item" : "➕ Add New Item"}
            </h3>
            <div style={styles.modalContent}>

              {keys
                .filter((k) => k !== "S/N")
                .map((k, i) => (
                  <div key={i} style={styles.formRow}>
                    <label style={styles.label}>{k}</label>
                    <input
                      style={styles.input}
                      value={formItem[k] || ""}
                      onChange={(e) =>
                        setFormItem({ ...formItem, [k]: e.target.value })
                      }
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
                  setIsEditing(false);
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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "#0b4a8b" },
  controls: { display: "flex", gap: 8 },
  searchInput: {
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
  },
  addBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
  },
  backBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
  },
  tableWrap: {
    marginTop: 10,
    overflowX: "auto",
    background: "#fff",
    borderRadius: 8,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#e8f0ff", position: "sticky", top: 0 },
  th: { textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #ccc" },
  td: { padding: "6px 10px", borderBottom: "1px solid #eee" },
  editBtn: {
    background: "#fbbf24",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "4px 8px",
    marginRight: 4,
  },
  delBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "4px 8px",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: { margin: 0, color: "#0b4a8b" },
  modalContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 10,
  },
  formRow: { display: "flex", flexDirection: "column" },
  label: { fontSize: 12, color: "#555" },
  input: { padding: "6px 8px", border: "1px solid #ccc", borderRadius: 4 },
  modalActions: {
    marginTop: 10,
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  saveBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 12px",
  },
  cancelBtn: {
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 12px",
  },
  count: { fontSize: 12, color: "#555" },
};

export default StockItems;
