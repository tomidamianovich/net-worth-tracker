import { useTranslation } from "../../i18n/hooks";
import CategoriesManager from "../CategoriesManager";
import "./CategoriesManagerModal.css";

interface CategoriesManagerModalProps {
  onClose: () => void;
}

function CategoriesManagerModal({ onClose }: CategoriesManagerModalProps) {
  const { t } = useTranslation();
  
  return (
    <div className="categories-modal-overlay" onClick={onClose}>
      <div className="categories-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="categories-modal-header">
          <h2>{t("categories.title")}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="categories-modal-body">
          <CategoriesManager />
        </div>
      </div>
    </div>
  );
}

export default CategoriesManagerModal;

