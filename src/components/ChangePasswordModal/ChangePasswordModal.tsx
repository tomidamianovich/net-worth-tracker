import { useState } from "react";
import { useTranslation } from "../../i18n/hooks";
import "./ChangePasswordModal.css";

interface ChangePasswordModalProps {
  username: string;
  onClose: () => void;
}

function ChangePasswordModal({ username, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setError(t("changePassword.allFieldsRequired") || "Todos los campos son requeridos");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(t("changePassword.passwordsDoNotMatch") || "Las nuevas contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 4) {
      setError(t("changePassword.passwordTooShort") || "La contraseña debe tener al menos 4 caracteres");
      return;
    }

    if (currentPassword === newPassword) {
      setError(t("changePassword.samePassword") || "La nueva contraseña debe ser diferente a la actual");
      return;
    }

    setLoading(true);
    try {
      if (!window.electronAPI?.changePassword) {
        setError(t("messages.electronNotAvailable") || "Electron no está disponible");
        setLoading(false);
        return;
      }

      const result = await window.electronAPI.changePassword(
        username,
        currentPassword,
        newPassword
      );

      if (result.success) {
        alert(t("changePassword.success") || "Contraseña cambiada exitosamente");
        onClose();
      } else {
        setError(result.error || t("changePassword.failed") || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError(t("changePassword.failed") || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("changePassword.title") || "Cambiar Contraseña"}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="currentPassword">
              {t("changePassword.currentPassword") || "Contraseña Actual"} *
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoFocus
              placeholder={t("changePassword.currentPasswordPlaceholder") || "Ingresa tu contraseña actual"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">
              {t("changePassword.newPassword") || "Nueva Contraseña"} *
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder={t("changePassword.newPasswordPlaceholder") || "Ingresa tu nueva contraseña"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmNewPassword">
              {t("changePassword.confirmNewPassword") || "Confirmar Nueva Contraseña"} *
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              placeholder={t("changePassword.confirmNewPasswordPlaceholder") || "Confirma tu nueva contraseña"}
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t("common.loading") : t("changePassword.change") || "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;

