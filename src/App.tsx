import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { Navbar } from './components/ui/Navbar';
import { Sidebar } from './components/ui/Sidebar';
import { Dashboard } from './components/ui/Dashboard';
import { NotesView } from './components/notes/NotesView';
import { CalendarView } from './components/calendar/CalendarView';
import { AIView } from './components/ai/AIView';
import { FilesView } from './components/files/FilesView';
import { ExportView } from './components/export/ExportView';
import { NoteModal } from './components/notes/NoteModal';

function AppContent() {
  const { currentView } = useApp();
  const [showNewNote, setShowNewNote] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  // Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX - 10}px`;
        cursorRef.current.style.top = `${e.clientY - 10}px`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX - 2}px`;
        dotRef.current.style.top = `${e.clientY - 2}px`;
      }
    };
    const enter = () => { if (cursorRef.current) cursorRef.current.style.transform = 'scale(1.8)'; };
    const leave = () => { if (cursorRef.current) cursorRef.current.style.transform = 'scale(1)'; };

    window.addEventListener('mousemove', move);
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
    });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNewNote={() => setShowNewNote(true)} />;
      case 'notes':     return <NotesView />;
      case 'calendar':  return <CalendarView />;
      case 'ai':        return <AIView />;
      case 'files':     return <FilesView />;
      case 'export':    return <ExportView />;
      default:          return <Dashboard onNewNote={() => setShowNewNote(true)} />;
    }
  };

  return (
    <>
      {/* Custom cursor */}
      <div ref={cursorRef} style={{
        width: 20, height: 20,
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '50%',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'transform 150ms cubic-bezier(0.4,0,0.2,1)',
        mixBlendMode: 'difference',
      }} />
      <div ref={dotRef} style={{
        width: 4, height: 4,
        background: 'white',
        borderRadius: '50%',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 99999,
      }} />

      <Navbar onNewNote={() => setShowNewNote(true)} />

      <div style={{
        display: 'flex',
        height: '100vh',
        paddingTop: 60,
        background: '#0A0A0A',
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.04) 0%, transparent 60%)',
        }} />

        <Sidebar />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <div key={currentView} className="animate-fade-up" style={{ minHeight: '100%' }}>
            {renderView()}
          </div>
        </main>
      </div>

      {showNewNote && (
        <NoteModal onClose={() => setShowNewNote(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
