"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#22c55e",
      dark: "#16a34a",
      light: "#4ade80",
    },
    secondary: {
      main: "#3b82f6",
    },
    error: {
      main: "#ef4444",
    },
    success: {
      main: "#22c55e",
    },
    background: {
      default: "#0c0c0f",
      paper: "#16161a",
    },
    text: {
      primary: "#f0f0f5",
      secondary: "#71717a",
    },
    divider: "#2a2a32",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

