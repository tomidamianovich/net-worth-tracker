import { HeaderProps } from "./types";
import { ViewType } from "../../types/views";
import { useTranslation } from "../../i18n/hooks";

function Header({
  currentView,
  onViewChange,
  onExport,
  onImport,
  onBackup,
  onRestore,
  onChangePassword,
  onCategories,
  currentUser,
  isBlurred,
  onToggleBlur,
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
                currentView === ViewType.Evolution ? "active" : ""
              }`}
              onClick={() => onViewChange(ViewType.Evolution)}
            >
              {t("nav.evolution")}
            </button>
            <button
              className={`nav-item ${
                currentView === ViewType.PropertyInvestment ? "active" : ""
              }`}
              onClick={() => onViewChange(ViewType.PropertyInvestment)}
            >
              {t("nav.propertyInvestment")}
            </button>
          </div>
        </nav>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="username">{currentUser}</span>
        </div>
        <button 
          className={`icon-btn ${isBlurred ? "active" : ""}`} 
          onClick={onToggleBlur} 
          title={isBlurred ? t("nav.showValues") : t("nav.hideValues")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button className="icon-btn" onClick={onCategories} title={t("nav.categories")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
        <button className="icon-btn" onClick={onChangePassword} title={t("nav.changePassword")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
          </svg>
        </button>
        <button className="icon-btn" onClick={onBackup} title={t("nav.backup")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="7" cy="7" r="4"></circle>
            <path d="M16 21v-2a4 4 0 0 1 4-4h2"></path>
            <path d="M21 21v-2a4 4 0 0 0-4-4h-2"></path>
          </svg>
        </button>
        <button className="icon-btn" onClick={onRestore} title={t("nav.restore")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
        </button>
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

