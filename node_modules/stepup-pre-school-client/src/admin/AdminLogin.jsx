import uploadedLogo from "../assets/my-logo.png";

function AdminLogin({
  login,
  setLogin,
  status,
  onSubmit,
  resetMode,
  resetForm,
  setResetForm,
  resetCodeSent,
  onOpenReset,
  onCloseReset,
  onRequestResetCode,
  onConfirmReset
}) {
  if (resetMode) {
    return (
      <main className="admin-page login-page">
        <form className="admin-login" onSubmit={onConfirmReset}>
          <img className="admin-logo-mark" src={uploadedLogo} alt="StepUp Pre School" />
          <button type="button" className="admin-link-button" onClick={onCloseReset}>
            &larr; Back to login
          </button>
          <h1>Reset Admin Access</h1>
          <p>
            {resetCodeSent
              ? "Enter the one-time code sent via WhatsApp along with your new sign-in details."
              : "Forgot your admin ID or password? Send a one-time reset code to the registered WhatsApp number."}
          </p>

          {!resetCodeSent && (
            <button className="button primary" type="button" onClick={onRequestResetCode}>
              Send Reset Code via WhatsApp
            </button>
          )}

          {resetCodeSent && (
            <>
              <label>
                Reset Code
                <input
                  value={resetForm.code}
                  onChange={(event) => setResetForm((current) => ({ ...current, code: event.target.value }))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength="6"
                  placeholder="6-digit code"
                  required
                />
              </label>
              <label>
                New Admin ID (optional)
                <input
                  value={resetForm.newUsername}
                  onChange={(event) => setResetForm((current) => ({ ...current, newUsername: event.target.value }))}
                  placeholder="Leave blank to keep the current ID"
                  autoComplete="username"
                  minLength="3"
                  maxLength="32"
                />
              </label>
              <label>
                New Password
                <input
                  type="password"
                  value={resetForm.newPassword}
                  onChange={(event) => setResetForm((current) => ({ ...current, newPassword: event.target.value }))}
                  autoComplete="new-password"
                  minLength="8"
                  required
                />
              </label>
              <label>
                Confirm New Password
                <input
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(event) => setResetForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  autoComplete="new-password"
                  minLength="8"
                  required
                />
              </label>
              <button className="button primary" type="submit">
                Reset Credentials
              </button>
              <button className="admin-link-button" type="button" onClick={onRequestResetCode}>
                Resend code
              </button>
            </>
          )}

          {status.message && <p className={`admin-status ${status.type}`}>{status.message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page login-page">
      <form className="admin-login" onSubmit={onSubmit}>
        <img className="admin-logo-mark" src={uploadedLogo} alt="StepUp Pre School" />
        <a className="admin-back-link" href="/">
          Back to website
        </a>
        <h1>StepUp Admin</h1>
        <p>Login to update website text, upload photos or videos, and view enquiries.</p>
        <label>
          Username
          <input
            value={login.username}
            onChange={(event) => setLogin((current) => ({ ...current, username: event.target.value }))}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={login.password}
            onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>
        <button className="button primary" type="submit">
          Login
        </button>
        <button type="button" className="admin-link-button" onClick={onOpenReset}>
          Forgot admin ID or password?
        </button>
        {status.message && <p className={`admin-status ${status.type}`}>{status.message}</p>}
      </form>
    </main>
  );
}

export default AdminLogin;