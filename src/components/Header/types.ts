import { ViewType } from "../../types/views";

export interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onExport: () => void;
  onImport: () => void;
}

