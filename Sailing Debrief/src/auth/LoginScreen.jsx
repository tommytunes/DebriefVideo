import { useState } from 'react';
import { supabase } from './supabaseClient';
import { URL } from '../constants/URL';

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [forgot, setForgot] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (forgot) {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${URL}reset-password`,
            });
            if (error) return setError(error.message);
            setMessage(`If an account exists for ${email}, we sent a reset link. Check your inbox.`);
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
    }

    return (
        <div className='card card-md bg-white'>
            <h1 className='card card-title font-bold p-2'>{forgot ? 'Forgot Password' : 'Sailing Debrief Authentification'}</h1>
            <form onSubmit={handleSubmit}>
                <div className='card card-body flex flex-col'>
                    <h2 className='text text-md font-bold'>{forgot ? 'Forgot Password' : 'Log In'}</h2>
                    <input className='input' type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                    {!forgot && <input className='input' type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {message && <p className="text-green-600 text-sm">{message}</p>}
                    <button className='btn' type="submit" disabled={!!message}>{forgot ? 'Send Reset Link' : 'Log In'}</button>
                    {forgot ? (
                        <button className='btn' type="button" onClick={() => { setForgot(false); setError(null); setMessage(null); }}>Back to Log In</button>
                    ) : (
                        <>
                            <a className='btn' onClick={() => window.electronAPI.openExternal(`${URL}account`)} target="_blank" rel="noreferrer">Need an account? Sign Up</a>
                            <button type="button" className="link link-hover text-sm" onClick={() => { setForgot(true); setError(null); setMessage(null); }}>
                                Forgot password?
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    )
}
