import { IconType } from "react-icons";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsBarChart, BsFileEarmarkText } from "react-icons/bs";
import type { MenuItem } from "../types";

export function createMenuItem(
  label: string,
  icon: IconType,
  onClick: () => void
): MenuItem {
  return {
    id: Math.random().toString(36).substr(2, 9),
    label,
    icon,
    onClick,
  };
}

export function createMenuItems(
  setShowOffcanvas: (show: boolean) => void,
  setShowStats: (show: boolean) => void,
  setShowDocs: (show: boolean) => void,
  setShowAbout: (show: boolean) => void
): MenuItem[] {
  const closeOffcanvas = () => setShowOffcanvas(false);

  return [
    createMenuItem("View Statistics", BsBarChart, () => {
      closeOffcanvas();
      setShowStats(true);
    }),
    createMenuItem("RFC Documentation", BsFileEarmarkText, () => {
      closeOffcanvas();
      setShowDocs(true);
    }),
    createMenuItem("About", AiOutlineInfoCircle, () => {
      closeOffcanvas();
      setShowAbout(true);
    }),
  ];
}
