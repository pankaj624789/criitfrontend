import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";

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

  const pages = [
    { title: "Indent", path: "/indent", icon: <DescriptionIcon fontSize="large" /> },
    { title: "Quotations", path: "/quotations", icon: <ReceiptIcon fontSize="large" /> },
    { title: "Invoice Manager", path: "/invoice-manager", icon: <InventoryIcon fontSize="large" /> },
    { title: "Assets", path: "/asset-summary", icon: <DashboardIcon fontSize="large" /> },
    { title: "Email Manager", path: "/email-manager", icon: <DashboardIcon fontSize="large" /> },

    // ⭐ NEW MENU ADDED HERE
    { title: "Cost Manager", path: "/cost-manager", icon: <ReceiptIcon fontSize="large" /> },
  ];

  const handleLogout = () => {
    if (setUser) setUser(null);
    navigate("/");
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ p: 4 }}>
        <Typography
          variant="h4"
          sx={{ textAlign: "center", fontWeight: "700", mb: 4 }}
        >
          CRI IT PORTAL
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {pages.map((page) => (
            <Grid item xs={12} sm={6} md={3} key={page.title}>
              <Card
                sx={{
                  bgcolor: "#1e1e1e",
                  borderRadius: "16px",
                  boxShadow: 6,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 12,
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(page.path)}>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Box sx={{ color: "primary.main", mb: 1 }}>
                      {page.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {page.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                      Click to view
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

