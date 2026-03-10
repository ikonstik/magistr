import React from "react";
import type { ChatScope } from "../../types";
import { ErrorMessage } from "../common/ErrorMessage";

interface AuthFormProps {
  onAuthenticated: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [credentials, setCredentials] = React.useState("");
  const [scope, setScope] = React.useState<ChatScope>("GIGACHAT_API_PERS");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!credentials.trim()) {
      setError("Поле credentials не должно быть пустым.");
      return;
    }
    setError(null);
    // Моковая авторизация
    onAuthenticated();
  };

  return (
    <div className="auth-screen">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-form__title">Вход в GigaChat</h1>

        <label className="field">
          <span className="field__label">Credentials (Base64)</span>
          <input
            type="password"
            className="input"
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            placeholder="Введите Base64-строку"
          />
        </label>

        <fieldset className="field auth-form__scope">
          <legend className="field__label">Scope</legend>
          <label className="radio">
            <input
              type="radio"
              name="scope"
              value="GIGACHAT_API_PERS"
              checked={scope === "GIGACHAT_API_PERS"}
              onChange={() => setScope("GIGACHAT_API_PERS")}
            />
            <span>GIGACHAT_API_PERS</span>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="scope"
              value="GIGACHAT_API_B2B"
              checked={scope === "GIGACHAT_API_B2B"}
              onChange={() => setScope("GIGACHAT_API_B2B")}
            />
            <span>GIGACHAT_API_B2B</span>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="scope"
              value="GIGACHAT_API_CORP"
              checked={scope === "GIGACHAT_API_CORP"}
              onChange={() => setScope("GIGACHAT_API_CORP")}
            />
            <span>GIGACHAT_API_CORP</span>
          </label>
        </fieldset>

        {error && <ErrorMessage message={error} />}

        <button type="submit" className="btn btn--primary auth-form__submit">
          Войти
        </button>
      </form>
    </div>
  );
};

