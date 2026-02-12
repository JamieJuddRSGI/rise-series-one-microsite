import React from 'react';
import { Menu, X, Home, List, Users, FileText, LogOut, Scale } from 'lucide-react';
import resightLogo from '../assets/site/Resight_India_logo_RED.png';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  userEmail?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onLogout, userEmail }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'table-of-contents', label: 'Rankings', icon: List },
    { id: 'profiles', label: 'Profiles', icon: Users },
    { id: 'comparison', label: 'Comparison', icon: Scale },
    { id: 'insights', label: 'Insights', icon: FileText },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src={resightLogo} 
              alt="Resight India Logo" 
              className="h-16 w-auto object-contain"
            />
            <span className="hidden sm:block" style={{ color: '#000000' }}>RISE Lawyers in Private Capital</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || 
                (item.id === 'profiles' && currentPage.startsWith('lawyer-')) ||
                (item.id === 'insights' && currentPage.startsWith('article-')) ||
                (item.id === 'comparison' && currentPage.startsWith('comparison'));
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                  style={isActive ? { 
                    backgroundColor: '#ef3c24', 
                    color: '#ffffff' 
                  } : { 
                    color: '#575757' 
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-4 px-4 py-2 rounded-md transition-colors flex items-center space-x-2 border hover:bg-red-50"
                style={{ color: '#575757', borderColor: '#e2e8f0' }}
                title={userEmail ? `Logout (${userEmail})` : 'Logout'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#575757';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: '#000000' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || 
                (item.id === 'profiles' && currentPage.startsWith('lawyer-')) ||
                (item.id === 'insights' && currentPage.startsWith('article-')) ||
                (item.id === 'comparison' && currentPage.startsWith('comparison'));
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-md transition-colors flex items-center space-x-3"
                  style={isActive ? { 
                    backgroundColor: '#ef3c24', 
                    color: '#ffffff' 
                  } : { 
                    color: '#575757',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Mobile Logout button */}
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-md transition-colors flex items-center space-x-3 border hover:bg-red-50"
                style={{ color: '#575757', borderColor: '#e2e8f0' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#575757';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <LogOut size={20} />
                <span>Logout{userEmail ? ` (${userEmail})` : ''}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
