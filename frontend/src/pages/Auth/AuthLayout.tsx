import Brand from "../../components/Brand";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <section className="auth-layout__art" aria-hidden>
        <div className="auth-layout__glow" />
        <blockquote>
          “A good story is a lantern
          <br />
          in the dark.”
        </blockquote>
      </section>

      <section className="auth-card">
        <Brand to="/login" />
        <h1>{title}</h1>
        <p className="auth-card__subtitle">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

export default AuthLayout;
