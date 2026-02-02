import type { ReactNode } from "react";
import type { IconType } from "react-icons";

export interface ModalProps {
  readonly show: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly size?: "sm" | "lg" | "xl";
  readonly centered?: boolean;
  readonly backdrop?: boolean | "static";
}

export interface MenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon: IconType;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly badge?: string | number;
}

export interface ButtonProps {
  readonly variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "link";
  readonly size?: "sm" | "lg";
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly onClick?: () => void;
  readonly children: ReactNode;
  readonly type?: "button" | "submit" | "reset";
}

export interface FormFieldProps {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
}

export interface ToastMessage {
  readonly id: string;
  readonly type: "success" | "error" | "warning" | "info";
  readonly title: string;
  readonly message?: string;
  readonly duration?: number;
  readonly persistent?: boolean;
}

// Component-specific UI Types

// Result Feedback Types
export interface ResultFeedbackProps {
  readonly isCorrect: boolean;
  readonly message: string;
  readonly details?: ReactNode;
}

// Menu Types
export interface MenuItemProps {
  readonly icon: IconType;
  readonly label: string;
  readonly onClick: () => void;
}

export interface OffcanvasMenuProps {
  readonly show: boolean;
  readonly onClose: () => void;
  readonly menuItems: MenuItemProps[];
}

// Modal Types
export interface ModalDialogProps {
  readonly show: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly size?: "sm" | "lg" | "xl";
  readonly footer?: ReactNode;
}

export interface AboutModalProps {
  readonly show: boolean;
  readonly onClose: () => void;
}

export interface DocsModalProps {
  readonly show: boolean;
  readonly onClose: () => void;
}

// Header Types
export interface HeaderProps {
  readonly onOpenMenu: () => void;
}

// Card Types
export interface CardProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export interface ComparisonCardProps {
  readonly label: string;
  readonly value: string;
  readonly className?: string;
  readonly variant?: "success" | "danger" | "default";
}

// Learning Resource Types
export interface RFCLink {
  readonly title: string;
  readonly url: string;
  readonly description?: string;
}

export interface LearningResource {
  readonly title: string;
  readonly content: string;
  readonly links?: RFCLink[];
}
