import { useState, useEffect } from "react";
import { useTranslation } from "../../i18n/hooks";
import "./Login.css";

interface LoginProps {
  onLogin: (username: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const { t } = useTranslation();
  // Load last username from localStorage
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lastUsername") || "";
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkHasUsers();
  }, []);

  const checkHasUsers = async () => {
    try {
      if (!window.electronAPI?.hasUsers) {
        setLoading(false);
        return;
      }
      const hasUsers = await window.electronAPI.hasUsers();
      setIsSetup(!hasUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error checking users:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSetup) {
      // Setup initial user
      if (!username.trim() || !password.trim()) {
        setError(t("login.allFieldsRequired") || "Todos los campos son requeridos");
        return;
      }

      if (password !== confirmPassword) {
        setError(t("login.passwordsDoNotMatch") || "Las contraseñas no coinciden");
        return;
      }

      if (password.length < 4) {
        setError(t("login.passwordTooShort") || "La contraseña debe tener al menos 4 caracteres");
        return;
      }

      try {
        if (!window.electronAPI?.setupInitialUser) {
          setError(t("messages.electronNotAvailable") || "Electron no está disponible");
          return;
        }

        const result = await window.electronAPI.setupInitialUser(username.trim(), password);
        if (result.success) {
          onLogin(username.trim());
        } else {
          setError(result.error || t("login.setupFailed") || "Error al crear el usuario");
        }
      } catch (error) {
        console.error("Error setting up user:", error);
        setError(t("login.setupFailed") || "Error al crear el usuario");
      }
    } else {
      // Login
      if (!username.trim() || !password.trim()) {
        setError(t("login.allFieldsRequired") || "Todos los campos son requeridos");
        return;
      }

      try {
        if (!window.electronAPI?.login) {
          setError(t("messages.electronNotAvailable") || "Electron no está disponible");
          return;
        }

        const result = await window.electronAPI.login(username.trim(), password);
        if (result.success) {
          onLogin(username.trim());
        } else {
          setError(t("login.invalidCredentials") || "Usuario o contraseña incorrectos");
        }
      } catch (error) {
        console.error("Error logging in:", error);
        setError(t("login.loginFailed") || "Error al iniciar sesión");
      }
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-loading">
          <div className="loading-spinner"></div>
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{t("login.title") || "Net Worth Tracker"}</h1>
          <p className="login-subtitle">
            {isSetup
              ? t("login.setupSubtitle") || "Configura tu usuario inicial"
              : t("login.subtitle") || "Inicia sesión para continuar"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              {t("login.username") || "Usuario"} *
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder={t("login.usernamePlaceholder") || "Ingresa tu usuario"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {t("login.password") || "Contraseña"} *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t("login.passwordPlaceholder") || "Ingresa tu contraseña"}
            />
          </div>

          {isSetup && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                {t("login.confirmPassword") || "Confirmar Contraseña"} *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder={t("login.confirmPasswordPlaceholder") || "Confirma tu contraseña"}
              />
            </div>
          )}

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            {isSetup
              ? t("login.createUser") || "Crear Usuario"
              : t("login.login") || "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

