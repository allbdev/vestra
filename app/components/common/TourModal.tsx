import {
  Popover,
  Typography,
  Box,
  IconButton,
  Button,
  Dialog,
} from "@mui/material";
import { IoClose } from "react-icons/io5";

interface TourModalProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null; // Element to attach the popover to
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  placement?: "top" | "bottom" | "left" | "right";
  isMobile?: boolean;
}

interface ModalContentProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}
  
// Content Inner Component to reuse
const ModalContent = ({ title, subtitle, actionLabel, onAction, onClose }: ModalContentProps) => (
  <>
    <IconButton
      aria-label="close"
      onClick={onClose}
      size="small"
      sx={{
        position: "absolute",
        right: 8,
        top: 8,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <IoClose />
    </IconButton>

    <Box sx={{ mb: 1, pr: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
          {title}
      </Typography>
    </Box>

    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>

    {actionLabel && onAction && (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          onClick={onAction} 
          size="small"
          fullWidth
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          {actionLabel}
        </Button>
      </Box>
    )}
  </>
);

export function TourModal({
  open,
  onClose,
  anchorEl,
  title,
  subtitle,
  actionLabel,
  onAction,
  placement = "bottom",
  isMobile = false,
}: TourModalProps) {

  if (isMobile) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
            sx: {
                borderRadius: "12px",
                padding: "16px",
                position: "relative",
                margin: "16px"
            }
        }}
      >
        <ModalContent
          title={title}
          subtitle={subtitle}
          actionLabel={actionLabel}
          onAction={onAction}
          onClose={onClose}
         />
      </Dialog>
    );
  }

  // Desktop Popover
  const anchorOriginMap: Record<string, { vertical: 'top' | 'bottom' | 'center', horizontal: 'left' | 'right' | 'center' }> = {
    top: { vertical: 'top', horizontal: 'center' },
    bottom: { vertical: 'bottom', horizontal: 'center' },
    left: { vertical: 'center', horizontal: 'left' },
    right: { vertical: 'center', horizontal: 'right' },
  };

  const transformOriginMap: Record<string, { vertical: 'top' | 'bottom' | 'center', horizontal: 'left' | 'right' | 'center' }> = {
    top: { vertical: 'bottom', horizontal: 'center' },
    bottom: { vertical: 'top', horizontal: 'center' },
    left: { vertical: 'center', horizontal: 'right' },
    right: { vertical: 'center', horizontal: 'left' },
  };

  return (
    <Popover
      open={open && Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOriginMap[placement]}
      transformOrigin={transformOriginMap[placement]}
      disableRestoreFocus // Prevent focus stealing issues in some flows
      slotProps={{
        paper: {
            sx: {
                maxWidth: "320px",
                width: "100%",
                borderRadius: "12px",
                padding: "16px",
                position: "relative",
                mt: placement === 'bottom' ? 1 : 0,
                mb: placement === 'top' ? 1 : 0,
                ml: placement === 'right' ? 1 : 0,
                mr: placement === 'left' ? 1 : 0,
            }
        }
      }}
    >
      <ModalContent
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        onAction={onAction}
        onClose={onClose}
      />
    </Popover>
  );
}
