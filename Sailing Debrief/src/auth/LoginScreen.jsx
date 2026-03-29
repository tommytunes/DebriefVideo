import { useState } from 'react';
import { supabase } from './supabaseClient';

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const { error } = isSignUp
        ? await supabase.auth.signUp( { email, password})
        : await supabase.auth.signInWithPassword({ email, password})

        if (error) setError(error.message);
    }

    return (
      <form onSubmit={handleSubmit}>
        <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isSignUp ? 'Sign Up' : 'Log In'}</button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Have an account? Log in' : 'Need an account? Sign up'}
        </button>
      </form>
    )
  }