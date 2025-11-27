// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import axios from "axios";

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
  Collapse
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
  const [openEmail, setOpenEmail] = useState(false);
  const [openCost, setOpenCost] = useState(false);

  const [summary, setSummary] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + "/asset-summary");
      setSummary(res.data || []);
    } catch (err) {
      console.error("Error loading summary", err);
      setSummary([]);
    }
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

            <Collapse in={openAssets}>
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

            {/* EMAIL */}
            <ListItemButton onClick={() => setOpenEmail(!openEmail)}>
              <ListItemIcon>
                <DashboardIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Email Manager" />
              {openEmail ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openEmail}>
              <List disablePadding>
                <ListItemButton sx={{ pl: 6 }} onClick={() => navigate("/email-manager")}>
                  <ListItemIcon>
                    <DashboardIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Email Manager" />
                </ListItemButton>

                <ListItemButton sx={{ pl: 6 }} onClick={() => navigate("/emailsummary")}>
                  <ListItemIcon>
                    <DashboardIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Email Summary" />
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

            <Collapse in={openCost}>
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
    mt: "80px",   // pushes content below the fixed header
  }}
>


          {/* PAGE HEADER WITH BACKGROUND */}
       {/* PAGE HEADER WITH BACKGROUND */}
{/* PAGE HEADER – FULL WIDTH, ALIGNED WITH SIDEBAR */}

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
  <Typography
    variant="h4"
    fontWeight={700}
    sx={{ color: "white" }}   // 👈 white font
  >
    Welcome to CRI IT Portal
  </Typography>
</Box>



{/* TABLE SECTION */}
<Box sx={{ position: "relative", left: "-250px", top: "-50px" }}>
  {/* Table Header */}
  <Typography 
    variant="h5" 
    fontWeight={700} 
    sx={{ mb: 0.5, textAlign: "left" }} // mb: 0 removes gap
  >
    Assets
  </Typography>

  {summary.length > 0 ? (
    <AssetSummaryTable summary={summary} />
  ) : (
    <Typography sx={{ textAlign: "center", mt: 3 }}>
      Loading summary...
    </Typography>
  )}
</Box>




        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

