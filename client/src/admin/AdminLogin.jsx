import uploadedLogo from "../assets/my-logo.png";

function AdminLogin({ login, setLogin, status, onSubmit }) {
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
        {status.message && <p className={`admin-status ${status.type}`}>{status.message}</p>}
      </form>
    </main>
  );
}

export default AdminLogin;