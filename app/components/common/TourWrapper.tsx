"use client";

import React, { useRef, useState, useEffect } from "react";
import { TourModal } from "./TourModal";

import { useMediaQuery } from "@mui/material";

interface TourWrapperProps<T extends HTMLElement = HTMLElement> {
  children: (ref: React.RefObject<T>) => React.ReactNode;
  show: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  placement?: "top" | "bottom" | "left" | "right";
}

export function TourWrapper<T extends HTMLElement = HTMLElement>({
  children,
  show,
  onClose,
  title,
  subtitle,
  actionLabel,
  onAction,
  placement = "bottom",
}: TourWrapperProps<T>) {
  // Use state to store the element and trigger re-render when available
  const [anchorEl, setAnchorEl] = useState<T | null>(null);
  const elementRef = useRef<T>(null) as React.RefObject<T>;
  
  // Use MUI media query to detect mobile (same breakpoint as layout for consistency)
  // Assuming theme default or custom, but MD (768px) is a good standard fallback if theme is not available directly in hook.
  // Actually, useMediaQuery accepts a query string.
  const isMobile = useMediaQuery("(max-width:768px)");

  // Sync ref to state
  useEffect(() => {
    if (elementRef.current) {
        setAnchorEl(elementRef.current);
    }
  }, [show]); // Re-check when show changes, in case it wasn't mounted or something

  return (
    <>
        {children(elementRef)}
        <TourModal
            open={show}
            onClose={onClose}
            anchorEl={anchorEl}
            title={title}
            subtitle={subtitle}
            actionLabel={actionLabel}
            onAction={onAction}
            placement={placement}
            isMobile={isMobile}
        />
    </>
  );
}
