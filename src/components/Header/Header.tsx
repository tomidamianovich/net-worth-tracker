import { HeaderProps } from "./types";
import { ViewType } from "../../types/views";
import { useTranslation } from "../../i18n/hooks";

function Header({
  currentView,
  onViewChange,
  onExport,
  onImport,
}: HeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="header">
      <div className="header-left">
        <nav className="header-nav">
          <div className="nav-group-left">
            <button
              className={`nav-item ${
                currentView === ViewType.Portfolio ? "active" : ""
              }`}
              onClick={() => onViewChange(ViewType.Portfolio)}
            >
              {t("nav.portfolio")}
            </button>
            <button
              className={`nav-item ${
                currentView === ViewType.Analysis ? "active" : ""
              }`}
              onClick={() => onViewChange(ViewType.Analysis)}
            >
              {t("nav.analysis")}
            </button>
            <button
              className={`nav-item ${
                currentView === ViewType.Evolution ? "active" : ""
              }`}
              onClick={() => onViewChange(ViewType.Evolution)}
            >
              {t("nav.evolution")}
            </button>
            <button
              className={`nav-item ${
                currentView === ViewType.Categories ? "active" : ""
              }`}
              onClick={() => onViewChange(ViewType.Categories)}
            >
              {t("nav.categories")}
            </button>
          </div>
        </nav>
      </div>
      <div className="header-right">
        <button className="icon-btn" onClick={onImport} title={t("nav.import")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
        <button className="icon-btn" onClick={onExport} title={t("nav.export")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Header;

