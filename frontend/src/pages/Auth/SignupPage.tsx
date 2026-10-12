import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../api/getErrorMessage";
import AuthLayout from "./AuthLayout";

function SignupPage() {
  const { signup } = useAuth();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signup(userData);
      toast.success("Account created — welcome! ✨");
      navigate("/projects", { replace: true });
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
    <AuthLayout
      title="Begin your story"
      subtitle="Create a home for your worlds."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Username</span>
          <input
            type="text"
            placeholder="Your pen name"
            value={userData.username}
            name="username"
            autoComplete="username"
            maxLength={40}
            aria-invalid={!!error}
            onChange={handleChange}
            required
          />
        </label>
        <label className="field">
          <span className="field__label">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={userData.email}
            name="email"
            autoComplete="email"
            aria-invalid={!!error}
            onChange={handleChange}
            required
          />
        </label>
        <label className="field">
          <span className="field__label">Password</span>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={userData.password}
            name="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            aria-invalid={!!error}
            onChange={handleChange}
            required
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
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="auth-card__switch">
        Already writing with us? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default SignupPage;
