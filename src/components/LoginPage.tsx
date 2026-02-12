import React from 'react';
import { Mail, ArrowRight, Shield, AlertCircle, Lock } from 'lucide-react';
import { publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  onLoginSuccess: (email?: string, sessionToken?: string) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store session token in localStorage as fallback for Safari cookie issues
        if (data.sessionToken) {
          try {
            localStorage.setItem('resight_session_token', data.sessionToken);
          } catch (e) {
            console.warn('Failed to store session token in localStorage:', e);
          }
        }
        
        // Pass email and token to onLoginSuccess so auth state can be set immediately
        setTimeout(() => {
          onLoginSuccess(data.email, data.sessionToken);
        }, 100); // Reduced delay since we're setting state immediately
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-8 text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to home</span>
        </button>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-10 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-center mb-2" style={{ 
              fontFamily: 'Capriola, sans-serif',
              fontSize: '28px',
              fontWeight: 400,
              letterSpacing: '0.01em',
              lineHeight: '1.3'
            }}>
              Secure Access
            </h1>
            <p className="text-center text-slate-300" style={{
              fontFamily: 'Open Sans, sans-serif',
              fontSize: '14px',
              letterSpacing: '0.01em'
            }}>
              Enter your credentials to access the report
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800" style={{
                  fontFamily: 'Open Sans, sans-serif',
                  fontSize: '14px'
                }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} method="post" action="#" autoComplete="on">
              <div className="mb-4">
                <label className="block text-slate-700 mb-2" style={{
                  fontFamily: 'Open Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    style={{
                      fontFamily: 'Open Sans, sans-serif',
                      fontSize: '16px'
                    }}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 mb-2" style={{
                  fontFamily: 'Open Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    style={{
                      fontFamily: 'Open Sans, sans-serif',
                      fontSize: '16px'
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                style={{
                  fontFamily: 'Capriola, sans-serif',
                  fontSize: '16px',
                  letterSpacing: '0.02em'
                }}
              >
                {loading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-center space-x-2 text-slate-500">
              <Shield className="w-4 h-4" />
              <p style={{
                fontFamily: 'Open Sans, sans-serif',
                fontSize: '12px'
              }}>
                Secure password authentication
              </p>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div style={{
          backgroundColor: '#F3F4F6',
          borderLeft: '4px solid #6B7280',
          padding: '12px 16px',
          borderRadius: '4px',
          marginTop: '12px'
        }}>
          <div style={{
            color: '#374151',
            fontWeight: 500,
            fontSize: '13px',
            marginBottom: '6px'
          }}>Need Access?</div>
          <div style={{
            color: '#4B5563',
            fontSize: '12px'
          }}>
            <p>Please use your Resight India login credentials, or contact RSGI.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
