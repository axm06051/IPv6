import { BsBarChart, BsFileEarmarkText } from 'react-icons/bs';
import { AiOutlineInfoCircle } from 'react-icons/ai';

export function createMenuItem(label, icon, onClick) {
  return { label, icon, onClick };
}

export function createMenuItems(setShowOffcanvas, setShowStats, setShowDocs, setShowAbout) {
  const closeOffcanvas = () => setShowOffcanvas(false);
  
  return [
    createMenuItem('View Statistics', BsBarChart, () => {
      closeOffcanvas();
      setShowStats(true);
    }),
    createMenuItem('RFC Documentation', BsFileEarmarkText, () => {
      closeOffcanvas();
      setShowDocs(true);
    }),
    createMenuItem('About', AiOutlineInfoCircle, () => {
      closeOffcanvas();
      setShowAbout(true);
    })
  ];
}