import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const login = useStore((state) => state.login);
  const signup = useStore((state) => state.signup);
  const resetPassword = useStore((state) => state.resetPassword);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address above, then click Forgot Password.');
      return;
    }
    setError('');
    const success = await resetPassword(email);
    if (success) {
      setResetSent(true);
    } else {
      setError('Could not send reset email. Check the address and try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const success = isSignup 
        ? await signup(email, password)
        : await login(email, password);
        
      if (!success) {
        setError(isSignup 
          ? 'Failed to create account. Email may already be in use.' 
          : 'Invalid email or password.'
        );
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brutal-bg flex items-center justify-center p-4">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 border-2 border-brutal-text/10 rounded-full opacity-50" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-brutal-yellow/20 rounded-full opacity-30" />
      <div className="absolute top-1/3 right-10 w-4 h-4 bg-brutal-yellow/30 rounded-full" />
      <div className="absolute bottom-1/3 left-10 w-6 h-6 border-2 border-brutal-violet/40 rounded-full" />
      
      <div className="brutal-panel w-full max-w-md p-8 md:p-10 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brutal-text mb-2">
            AA Tracker
          </h1>
          <p className="text-brutal-text-secondary font-mono text-sm uppercase tracking-wider">
            Personal Recovery Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-text-secondary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-4 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text placeholder:text-brutal-text-secondary focus:border-brutal-yellow focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="eyebrow block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutal-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-4 bg-brutal-text/5 border-2 border-brutal-text/20 rounded-lg text-brutal-text placeholder:text-brutal-text-secondary focus:border-brutal-yellow focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brutal-text-secondary hover:text-brutal-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border-2 border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Reset success */}
          {resetSent && (
            <div className="p-3 bg-brutal-green/10 border-2 border-brutal-green/30 rounded-lg text-brutal-green text-sm">
              Password reset email sent. Check your inbox.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="brutal-btn w-full py-4 text-lg"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle Signup/Login + Forgot Password */}
        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setResetSent(false);
            }}
            className="text-sm text-brutal-yellow hover:underline block w-full"
          >
            {isSignup
              ? 'Already have an account? Sign in'
              : 'Need an account? Create one'}
          </button>
          {!isSignup && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-brutal-text-secondary hover:text-brutal-text transition-colors"
            >
              Forgot password?
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-brutal-text/10 text-center">
          <p className="text-sm text-brutal-text-secondary">
            One day. One meeting. One block.
          </p>
        </div>
      </div>
    </div>
  );
}
