import React from 'react';
import { Navigation } from './components/Navigation';
import { SplashPage } from './components/SplashPage';
import { LoginPage } from './components/LoginPage';
import { TableOfContents } from './components/TableOfContents';
import { LawyerProfile } from './components/LawyerProfile';
import { InsightsPage } from './components/InsightsPage';
import { ArticlePage } from './components/ArticlePage';
import { ProfilesPage } from './components/ProfilesPage';
import { ComparisonPage } from './components/ComparisonPage';
import { lawyers, articles } from './data/siteData';
import { checkAuth, logout, AuthState } from './utils/auth';

export default function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [authState, setAuthState] = React.useState<AuthState>({
    authenticated: false,
    loading: true,
  });
  const [showLogin, setShowLogin] = React.useState(false);
  const [intendedPage, setIntendedPage] = React.useState<string | null>(null);

  // Check authentication on mount
  React.useEffect(() => {
    checkAuth().then(state => {
      setAuthState(state);
    });
  }, []);

  const handleNavigate = (page: string) => {
    // Public pages that don't require authentication
    const publicPages = ['home', 'insights'];
    
    // Check if page is an article (articles have IDs like 'article-1', 'article-2')
    const isArticlePage = articles.some(a => a.id === page);
    
    if (publicPages.includes(page) || isArticlePage) {
      setCurrentPage(page);
      setShowLogin(false);
      setIntendedPage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Protected pages - require authentication
    if (!authState.authenticated) {
      setIntendedPage(page);
      setShowLogin(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // User is authenticated or bypass enabled, allow navigation
    setCurrentPage(page);
    setShowLogin(false);
    setIntendedPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = async (email?: string, sessionToken?: string) => {
    // Immediately set auth state to authenticated since login was successful
    // This prevents the race condition where checkAuth fails before Safari sets cookie
    if (email) {
      setAuthState({
        authenticated: true,
        email: email,
        loading: false,
      });
    } else {
      // Fallback: verify auth state (should work now with localStorage token)
      const state = await checkAuth();
      setAuthState(state);
    }
    
    // Navigate to intended page or table of contents
    const destination = intendedPage || 'table-of-contents';
    setCurrentPage(destination);
    setShowLogin(false);
    setIntendedPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      setAuthState({
        authenticated: false,
        loading: false,
      });
      setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPage = () => {
    // Show login page if flagged
    if (showLogin) {
      return (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onBack={() => {
            setShowLogin(false);
            setIntendedPage(null);
            setCurrentPage('home');
          }}
        />
      );
    }

    // Home page (public)
    if (currentPage === 'home') {
      return <SplashPage onNavigate={handleNavigate} />;
    }

    // Insights listing (public)
    if (currentPage === 'insights') {
      return <InsightsPage onNavigate={handleNavigate} />;
    }

    // Individual article (public)
    const article = articles.find(a => a.id === currentPage);
    if (article) {
      return <ArticlePage article={article} onNavigate={handleNavigate} />;
    }

    // All other pages require authentication
    if (!authState.authenticated) {
      // Should not happen due to handleNavigate logic, but safety check
      setShowLogin(true);
      return null;
    }

    // Table of contents / Rankings
    if (currentPage === 'table-of-contents') {
      return <TableOfContents onNavigate={handleNavigate} />;
    }

    // Profiles listing
    if (currentPage === 'profiles') {
      return <ProfilesPage onNavigate={handleNavigate} />;
    }

    // Comparison page
    if (currentPage === 'comparison') {
      return <ComparisonPage onNavigate={handleNavigate} />;
    }

    // Comparison with pre-selected lawyers
    if (currentPage.startsWith('comparison-')) {
      const parts = currentPage.split('-');
      const lawyer1Id = parts[1] || '';
      const lawyer2Id = parts[2] || '';
      return <ComparisonPage onNavigate={handleNavigate} preSelectedLawyer1={lawyer1Id} preSelectedLawyer2={lawyer2Id} />;
    }

    // Individual lawyer profile
    const lawyer = lawyers.find(l => l.id === currentPage);
    if (lawyer) {
      return <LawyerProfile lawyer={lawyer} onNavigate={handleNavigate} />;
    }

    // Default fallback to home
    return <SplashPage onNavigate={handleNavigate} />;
  };

  // Check if current page is Insights or an article (public pages that need navigation)
  const isInsightsOrArticle = currentPage === 'insights' || articles.some(a => a.id === currentPage);

  return (
    <div className="min-h-screen bg-slate-50">
      {!showLogin && (authState.authenticated || currentPage === 'home' || isInsightsOrArticle) && (
        <Navigation 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          onLogout={(currentPage === 'home' || (!authState.authenticated && isInsightsOrArticle)) ? undefined : handleLogout}
          userEmail={(currentPage === 'home' || (!authState.authenticated && isInsightsOrArticle)) ? undefined : authState.email}
        />
      )}
      {renderPage()}
    </div>
  );
}
