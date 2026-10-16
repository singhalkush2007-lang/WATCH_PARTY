import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import Brand from '../components/Brand';
import { Stagger, Reveal } from '../components/motion/Motion';

// Sign in / Sign up. There are no real accounts yet, so the form simply
// takes you to the lobby (and says so).
export default function AuthPage({ mode = 'signin' }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const isSignIn = mode === 'signin';

  const submit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="auth">
      <aside className="auth-stage curtain" aria-hidden="true">
        <div className="auth-stage-light spotlight-cone" />
        <div className="auth-stage-top"><Brand to="/welcome" /></div>
        <div className="auth-stage-quote">
          <p className="serif auth-quote">“The best seat in the house is the one next to your people.”</p>
          <span className="caption">House rules · No. 1</span>
        </div>
        <div className="admit">
          <div className="admit-main">
            <span className="caption">Couchline · private screening</span>
            <span className="admit-title">Admit one</span>
            <span className="admit-sub">Row C · Seat 7</span>
          </div>
          <div className="admit-stub">
            <span className="caption">No.</span>
            <span className="admit-code">000427</span>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-mobile-brand"><Brand to="/welcome" /></div>
        <Stagger className="paper auth-card" gap={0.07} delay={0.2}>
          <Reveal><span className="eyebrow">{isSignIn ? 'Admit one' : 'New member'}</span></Reveal>
          <Reveal><h1 className="display-2">{isSignIn ? <>Welcome <span className="serif">back</span></> : <>Join the <span className="serif">house</span></>}</h1></Reveal>
          <Reveal><p className="muted">{isSignIn ? 'Sign in to find your rooms and your friends.' : 'Create an account to keep your rooms and your guest list.'}</p></Reveal>

          <Reveal>
            <form className="auth-form" onSubmit={submit}>
              {!isSignIn && (
                <div className="field">
                  <label htmlFor="auth-name">Your name</label>
                  <input id="auth-name" className="input" autoComplete="name" placeholder="How friends will see you" required />
                </div>
              )}
              <div className="field">
                <label htmlFor="auth-email">Email</label>
                <input id="auth-email" type="email" className="input" autoComplete="email" placeholder="you@example.com" required />
              </div>
              <div className="field">
                <label htmlFor="auth-password">Password</label>
                <div className="input-wrap">
                  <input id="auth-password" type={showPassword ? 'text' : 'password'} className="input" autoComplete={isSignIn ? 'current-password' : 'new-password'} required minLength={isSignIn ? undefined : 8} />
                  <button type="button" className="icon-btn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {!isSignIn && <span className="field-hint">At least 8 characters.</span>}
              </div>
              <button type="submit" className="btn btn-ink btn-lg btn-block">{isSignIn ? 'Take your seat' : 'Create my account'} <ArrowRight /></button>
            </form>
          </Reveal>

          <Reveal><p className="auth-note">Accounts aren't live yet: this takes you straight to the lobby.</p></Reveal>
          <Reveal><hr className="rule" /></Reveal>
          <Reveal>
            <p className="auth-switch">
              {isSignIn ? <>New here? <Link to="/signup">Create an account</Link></> : <>Already a member? <Link to="/signin">Sign in</Link></>}
              <span aria-hidden="true"> · </span>
              <Link to="/">Continue as a guest</Link>
            </p>
          </Reveal>
        </Stagger>
      </main>
    </div>
  );
}
