import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../api/getErrorMessage";
import AuthLayout from "./AuthLayout";

function LoginPage() {
  const { login } = useAuth();
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/projects";

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(userData);
      toast.success("Welcome back! 🌙");
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Your stories missed you.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Email</span>
          <input
            type="email"
            name="email"
            value={userData.email}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!error}
            required
            onChange={handleChange}
          />
        </label>
        <label className="field">
          <span className="field__label">Password</span>
          <input
            type="password"
            name="password"
            value={userData.password}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!error}
            required
            onChange={handleChange}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="auth-card__switch">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
