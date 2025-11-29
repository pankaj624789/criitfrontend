// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import axios from "axios";
import dayjs from "dayjs";

import {
  ThemeProvider,
  createTheme,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Button,
  Collapse,
  Snackbar,
  Alert,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import BuildIcon from "@mui/icons-material/Build";

import AssetSummaryTable from "./pages/AssetSummaryTable";

const drawerWidth = 260;

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();

  const [openAssets, setOpenAssets] = useState(false);
  const [openCost, setOpenCost] = useState(false);
  const [summary, setSummary] = useState([]);

  // ---------- Renewal notification ----------
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });

  useEffect(() => {
    fetchSummary();
    fetchRenewalsNotification();
  }, []);

  // ---------- Asset Summary ----------
  const fetchSummary = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + "/asset-summary");
      setSummary(res.data || []);
    } catch (err) {
      console.error("Error loading summary", err);
      setSummary([]);
    }
  };

  // ---------- Renewal Notification ----------
  const fetchRenewalsNotification = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL ;
      const res = await axios.get(`${API_URL}/renewals`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Filter renewals due within 2 months
      const dueSoon = data.filter((row) => {
        if (!row.next_due_date) return false;
        const nextDue = dayjs(row.next_due_date, "YYYY-MM-DD");
        const today = dayjs();
        const twoMonthsLater = today.add(2, "month");
        return nextDue.isAfter(today.subtract(1, "day")) && nextDue.isBefore(twoMonthsLater.add(1, "day"));
      });

      if (dueSoon.length > 0) {
        setSnackbar({
          open: true,
          message: `You have ${dueSoon.length} renewal(s) due within 2 months!`,
          severity: "warning",
        });
      }
    } catch (err) {
      console.error("Failed to fetch renewals for dashboard notification", err);
    }
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (setUser) setUser(null);
    navigate("/");
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: "flex" }}>
        {/* SIDEBAR */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#1e1e1e",
            },
          }}
        >
          <Toolbar>
            <Typography variant="h5" fontWeight={700}>
              CRI IT PORTAL
            </Typography>
          </Toolbar>

          <Divider />

          <List>
            <ListItemButton onClick={() => navigate("/indent")}>
              <ListItemIcon>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Indent" />
            </ListItemButton>

            <ListItemButton onClick={() => navigate("/invoice-manager")}>
              <ListItemIcon>
                <InventoryIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Invoice Manager" />
            </ListItemButton>

            {/* ASSETS */}
            <ListItemButton onClick={() => setOpenAssets(!openAssets)}>
              <ListItemIcon>
                <DashboardIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Assets" />
              {openAssets ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openAssets} timeout="auto" unmountOnExit>
              <List disablePadding>
                <ListItemButton sx={{ pl: 6 }} onClick={() => navigate("/asset-details")}>
                  <ListItemIcon>
                    <BuildIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Asset Details" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6 }} onClick={() => navigate("/asset-summary")}>
                  <ListItemIcon>
                    <BuildIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Asset Summary" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6 }} onClick={() => navigate("/scrap-items")}>
                  <ListItemIcon>
                    <BuildIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Scrap Items" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6 }} onClick={() => navigate("/stock-items")}>
                  <ListItemIcon>
                    <BuildIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Stock Items" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* COST */}
            <ListItemButton onClick={() => setOpenCost(!openCost)}>
              <ListItemIcon>
                <ReceiptIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Cost Manager" />
              {openCost ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openCost} timeout="auto" unmountOnExit>
              <List disablePadding>
                <ListItemButton sx={{ pl: 6 }} onClick={() => navigate("/cost-manager")}>
                  <ListItemIcon>
                    <ReceiptIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Cost Manager" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6 }} onClick={() => navigate("/cost-summary")}>
                  <ListItemIcon>
                    <ReceiptIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Cost Summary" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* RENEWAL */}
            <ListItemButton onClick={() => navigate("/renewal")}>
              <ListItemIcon>
                <ReceiptIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Renewal" />
            </ListItemButton>
          </List>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: 2, py: 1 }}
            >
              Logout
            </Button>
          </Box>
        </Drawer>

        {/* MAIN CONTENT */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            ml: `${drawerWidth}px`,
            mt: "80px",
          }}
        >
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: `${drawerWidth}px`,
              right: 0,
              height: "64px",
              bgcolor: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1200,
              boxShadow: 3,
            }}
          >
            <Typography variant="h4" fontWeight={700} sx={{ color: "white" }}>
              Welcome to CRI IT Portal
            </Typography>
          </Box>

          {/* TABLE SECTION */}
          <Box sx={{ position: "relative", left: "-250px", top: "-50px" }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, textAlign: "left" }}>
              Assets
            </Typography>

            {summary.length > 0 ? (
              <AssetSummaryTable summary={summary} />
            ) : (
              <Typography sx={{ textAlign: "center", mt: 3 }}>Loading summary...</Typography>
            )}
          </Box>
        </Box>

        {/* ---------- Renewal Snackbar ---------- */}
<Snackbar
  open={snackbar.open}
  autoHideDuration={8000}
  onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}
>
  <Alert
    severity={snackbar.severity}
    sx={{
      backgroundColor: "#ee3f39ff",   // custom background
      color: "#e8f806ff",              // custom font color
      fontWeight: 600,               // bold text
      borderRadius: "10px",          // smooth corners
      border: "1px solid #01050aff",   // optional border
    }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>

      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;



