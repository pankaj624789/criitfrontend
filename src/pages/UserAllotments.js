import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const UserAllotments = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [allotments, setAllotments] = useState([]);
  const [filteredAllotments, setFilteredAllotments] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Fetch users and all allotments initially
  useEffect(() => {
    fetchUsers();
    fetchAllAllotments();
  }, []);

  // Update table based on filter and search
  useEffect(() => {
    let data = allotments;

    if (selectedUser) {
      data = data.filter(a => a.user_name === selectedUser);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter(a =>
        a.item_name.toLowerCase().includes(lowerSearch) ||
        (a.make_model?.toLowerCase().includes(lowerSearch)) ||
        (a.asset_number?.toString().includes(lowerSearch))
      );
    }

    setFilteredAllotments(data);
  }, [selectedUser, search, allotments]);

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/asset-allotment/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Error fetching users:", err.response?.data || err.message);
    }
  };

  // Fetch all current allotments
  const fetchAllAllotments = async () => {
    try {
      const res = await axios.get(`${API_URL}/asset-allotment/current`);
      setAllotments(res.data);
      setFilteredAllotments(res.data);
    } catch (err) {
      console.error("❌ Error fetching allotments:", err.response?.data || err.message);
    }
  };

  // Format date as dd-mm-yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Start editing a row
  const startEditing = (a) => {
    setEditingId(a.allotment_id);
    setEditData({ ...a });
  };

  // Save update to backend
  const saveUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/asset-allotment/${id}`, editData);
      setEditingId(null);
      fetchAllAllotments();
    } catch (err) {
      console.error("❌ Error updating allotment:", err.response?.data || err.message);
      alert("Error updating allotment: " + err.message);
    }
  };

  // Delete an allotment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this allotment?")) return;
    try {
      await axios.delete(`${API_URL}/asset-allotment/${id}`);
      fetchAllAllotments();
    } catch (err) {
      console.error("❌ Error deleting allotment:", err.response?.data || err.message);
      alert("Error deleting allotment: " + err.message);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>👤 User-wise Allotted Items</h1>

      <div style={styles.controls}>
        <button
          style={styles.backBtn}
          onClick={() => (window.location.href = "/asset-details")}
        >
          ⬅ Back to Asset Details
        </button>

        <select
          style={styles.select}
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select User --</option>
          {users.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search Item / Asset..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <p style={styles.count}>
        Showing {filteredAllotments.length} items
      </p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th>User Name</th>
              <th>Asset No</th>
              <th>Depart.</th>
              <th>Item</th>
              <th>Item Make</th>
              <th>Item SN</th>
              <th>Allotment Date</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAllotments.map((a, idx) => (
              <tr key={a.allotment_id} style={{ background: idx % 2 === 0 ? "#f8f9fa" : "#fff" }}>
                <td>{a.user_name}</td>
                <td>{a.asset_number}</td>
                <td>
                  {editingId === a.allotment_id ? (
                    <input
                      value={editData.department}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                    />
                  ) : a.department}
                </td>
                <td>
                  {editingId === a.allotment_id ? (
                    <input
                      value={editData.item_name}
                      onChange={(e) => setEditData({ ...editData, item_name: e.target.value })}
                    />
                  ) : a.item_name}
                </td>
                <td>
                  {editingId === a.allotment_id ? (
                    <input
                      value={editData.item_make || ""}
                      onChange={(e) => setEditData({ ...editData, item_make: e.target.value })}
                    />
                  ) : a.item_make}
                </td>
                <td>
                  {editingId === a.allotment_id ? (
                    <input
                      value={editData.item_serial_no || ""}
                      onChange={(e) => setEditData({ ...editData, item_serial_no: e.target.value })}
                    />
                  ) : a.item_serial_no}
                </td>
                <td>{formatDate(a.allotment_date)}</td>
                <td>
                  {editingId === a.allotment_id ? (
                    <input
                      type="number"
                      value={editData.quantity}
                      onChange={(e) => setEditData({ ...editData, quantity: Number(e.target.value) })}
                      style={{ width: 60 }}
                    />
                  ) : a.quantity}
                </td>
                <td>
                  {editingId === a.allotment_id ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    >
                      <option value="Allotted">Allotted</option>
                      <option value="Returned">Returned</option>
                    </select>
                  ) : a.status}
                </td>
                <td>
                  {editingId === a.allotment_id ? (
                    <>
                      <button style={styles.saveBtn} onClick={() => saveUpdate(a.allotment_id)}>💾 Save</button>
                      <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>❌ Cancel</button>
                    </>
                  ) : (
                    <>
                      <button style={styles.editBtn} onClick={() => startEditing(a)}>✏️ Update</button>
                      <button style={styles.delBtn} onClick={() => handleDelete(a.allotment_id)}>🗑 Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: 20, background: "#f6f9fc", minHeight: "100vh" },
  title: { color: "#0b4a8b", marginBottom: 10 },
  controls: { display: "flex", gap: 10, marginBottom: 10, alignItems: "center" },
  backBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer"
  },
  select: { padding: 6 },
  searchInput: { padding: 6, flex: 1 },
  count: { fontSize: 12, color: "#555", marginBottom: 8 },
  tableWrap: { overflowX: "auto", borderRadius: 8 },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0", background: "#fff" },
  thead: { position: "sticky", top: 0, background: "#e8f0ff", zIndex: 1 },
  editBtn: { background: "#fbbf24", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", padding: "4px 8px", marginRight: 4 },
  delBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", padding: "4px 8px", marginRight: 4 },
  saveBtn: { background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", padding: "4px 8px", marginRight: 4 },
  cancelBtn: { background: "#9ca3af", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", padding: "4px 8px" },
};

export default UserAllotments;
