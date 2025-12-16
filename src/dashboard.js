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
  Collapse,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import BuildIcon from "@mui/icons-material/Build";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

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

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [freezeSidebar, setFreezeSidebar] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });

  useEffect(() => {
    fetchSummary();
    fetchRenewalsNotification();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        process.env.REACT_APP_API_URL + "/asset-summary"
      );
      setSummary(res.data || []);
    } catch {
      setSummary([]);
    }
  };

  const fetchRenewalsNotification = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${API_URL}/renewals`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const dueSoon = data.filter((row) => {
        if (!row.next_due_date) return false;
        const nextDue = dayjs(row.next_due_date);
        return nextDue.isBefore(dayjs().add(2, "month"));
      });

      if (dueSoon.length > 0) {
        setSnackbar({
          open: true,
          message: `You have ${dueSoon.length} renewal(s) due within 2 months!`,
          severity: "warning",
        });
      }
    } catch {}
  };

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
          variant={freezeSidebar ? "permanent" : "temporary"}
          open={freezeSidebar || drawerOpen}
          onClose={() => !freezeSidebar && setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#1e1e1e",
              display: "flex",
              flexDirection: "column",
            },
          }}
          onMouseEnter={() => !freezeSidebar && setDrawerOpen(true)}
          onMouseLeave={() => !freezeSidebar && setDrawerOpen(false)}
        >
          <Toolbar>
            <Typography variant="h5" fontWeight={700}>
              CRI IT PORTAL
            </Typography>
          </Toolbar>

          <Divider />

          {/* MENUS */}
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
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

              <ListItemButton onClick={() => setOpenAssets(!openAssets)}>
                <ListItemIcon>
                  <DashboardIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Assets" />
                {openAssets ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openAssets}>
                <List disablePadding>
                  {[
                    ["/asset-details", "Asset Details"],
                    ["/asset-summary", "Asset Summary"],
                    ["/scrap-items", "Scrap Items"],
                    ["/stock-items", "Stock Items"],
                  ].map(([path, label]) => (
                    <ListItemButton
                      key={path}
                      sx={{ pl: 6 }}
                      onClick={() => navigate(path)}
                    >
                      <ListItemIcon>
                        <BuildIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={label} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>

              <ListItemButton onClick={() => setOpenCost(!openCost)}>
                <ListItemIcon>
                  <ReceiptIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Cost Manager" />
                {openCost ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openCost}>
                <List disablePadding>
                  <ListItemButton
                    sx={{ pl: 6 }}
                    onClick={() => navigate("/cost-manager")}
                  >
                    <ListItemIcon>
                      <ReceiptIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Cost Manager" />
                  </ListItemButton>
                  <ListItemButton
                    sx={{ pl: 6 }}
                    onClick={() => navigate("/cost-summary")}
                  >
                    <ListItemIcon>
                      <ReceiptIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Cost Summary" />
                  </ListItemButton>
                </List>
              </Collapse>

              <ListItemButton onClick={() => navigate("/renewal")}>
                <ListItemIcon>
                  <ReceiptIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Renewal" />
              </ListItemButton>
            </List>
          </Box>

          <Divider />

          {/* FOOTER: FREEZE + LOGOUT */}
          <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
            <Tooltip title={freezeSidebar ? "Unfreeze Sidebar" : "Freeze Sidebar"}>
              <IconButton
                onClick={() => setFreezeSidebar((prev) => !prev)}
                color="primary"
              >
                {freezeSidebar ? <PushPinIcon /> : <PushPinOutlinedIcon />}
              </IconButton>
            </Tooltip>

            <IconButton color="error" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Drawer>

        {/* HOVER EDGE */}
        {!freezeSidebar && (
          <Box
            sx={{
              width: 12,
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 2000,
            }}
            onMouseEnter={() => setDrawerOpen(true)}
          />
        )}

        {/* MAIN CONTENT */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            ml: freezeSidebar ? `${drawerWidth}px` : 0,
            mt: "80px",
            transition: "margin-left 0.3s ease",
          }}
        >
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: freezeSidebar ? `${drawerWidth}px` : 0,
              right: 0,
              height: "64px",
              background:
                "rgba(12, 64, 235, 1) url('https://github.com/pankaj624789/image/blob/main/fsimage.png?raw=true') no-repeat top right",
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

          <Box
            sx={{
            mt: -0.5,
            ml: freezeSidebar ? 0 : 2,
            transition: "margin-left 0.3s ease",
           }}
         >
           <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            Assets
           </Typography>

          {summary.length > 0 ? (
           <AssetSummaryTable summary={summary} />
         ) : (
           <Typography sx={{ mt: 3 }}>Loading summary...</Typography>
         )}
        </Box>

        </Box>

        {/* SNACKBAR */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={8000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{
              backgroundColor: "#ee3f39ff",
              color: "#e8f806ff",
              fontWeight: 600,
              borderRadius: "10px",
              border: "1px solid #01050aff",
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


