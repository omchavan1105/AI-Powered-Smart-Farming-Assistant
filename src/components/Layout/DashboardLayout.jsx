import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7fbf7' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90
          }}
        />
      )}

      {/* Sidebar */}
      <div className="desktop-sidebar">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Mobile Header */}
      <div className="mobile-header" style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5eee7',
        alignItems: 'center',
        padding: '0 15px',
        zIndex: 80,
        justifyContent: 'space-between'
      }}>
        <button 
          onClick={() => setSidebarOpen(true)}
          style={{ background: '#e7f5e9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#166534', display: 'flex', alignItems: 'center' }}
        >
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#e7f5e9', borderRadius: '8px', display: 'grid', placeItems: 'center', fontSize: '16px' }}>🌿</div>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#166534', fontSize: '16px' }}>KrishiSetu</span>
        </div>
        <div style={{ width: '38px' }} /> {/* Spacer for centering */}
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '30px', maxWidth: '1200px' }} className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar .sidebar {
            transform: translateX(-100%);
          }
          .desktop-sidebar .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-close-btn {
            display: flex !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 15px !important;
            padding-top: 75px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
