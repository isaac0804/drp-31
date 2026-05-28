import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchSession, UserProfile, Player } from './types';
import { INITIAL_SESSIONS } from './data';
import { getCurrentUser, resetDemoUser, signInDemoUser, updateCurrentUser } from './auth';

// Component imports
import Header from './components/Header';
import SidebarDrawer from './components/SidebarDrawer';
import BottomNav from './components/BottomNav';
import ExploreScreen from './components/ExploreScreen';
import HostScreen from './components/HostScreen';
import MySessions from './components/MySessions';
import SessionDetails from './components/SessionDetails';
import ProfileScreen from './components/ProfileScreen';
import AuthScreen from './components/AuthScreen';

export default function App() {
  const [sessions, setSessions] = useState<MatchSession[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeScreen, setActiveScreen] = useState<string>('explore'); // explore, host, sessions, details, profile
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<MatchSession | null>(null);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load state from local storage dynamically
  useEffect(() => {
    const cachedSessions = localStorage.getItem('smash_sessions');

    if (cachedSessions) {
      try {
        setSessions(JSON.parse(cachedSessions));
      } catch (e) {
        setSessions(INITIAL_SESSIONS);
      }
    } else {
      setSessions(INITIAL_SESSIONS);
      localStorage.setItem('smash_sessions', JSON.stringify(INITIAL_SESSIONS));
    }

    setUser(getCurrentUser());
  }, []);

  const handleSignIn = () => {
    setUser(signInDemoUser());
  };

  // Update profile and cascade changes to any matching sessions
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (!user) {
      return;
    }

    const newUser = { ...user, ...updated };
    setUser(newUser);
    updateCurrentUser(newUser);

    // Cascade name/avatar updates
    const updatedSessions = sessions.map((s) => {
      let host = s.host;
      if (s.host.id === user.id) {
        host = { ...s.host, name: newUser.name, avatar: newUser.avatar };
      }
      const playersJoined = s.playersJoined.map((p) => {
        if (p.id === user.id) {
          return { ...p, name: newUser.name, avatar: newUser.avatar };
        }
        return p;
      });
      return { ...s, host, playersJoined };
    });

    setSessions(updatedSessions);
    localStorage.setItem('smash_sessions', JSON.stringify(updatedSessions));
  };

  // Restores base template data
  const handleResetData = () => {
    localStorage.removeItem('smash_sessions');
    setSessions(INITIAL_SESSIONS);
    setUser(resetDemoUser());
    setActiveScreen('explore');
    setSelectedSessionId(null);
    setEditingSession(null);
  };

  // Post a new court session
  const handlePostSession = (newSessionData: Omit<MatchSession, 'id' | 'host' | 'playersJoined'>) => {
    if (!user) {
      return;
    }

    const freshId = `session_${Date.now()}`;
    const hostPlayer: Player = {
      id: user.id,
      name: user.name,
      avatar: user.avatar
    };

    const finishedSession: MatchSession = {
      ...newSessionData,
      id: freshId,
      host: hostPlayer,
      playersJoined: [hostPlayer] // Host joined by default
    };

    const newSessions = [finishedSession, ...sessions];
    setSessions(newSessions);
    localStorage.setItem('smash_sessions', JSON.stringify(newSessions));
    setActiveScreen('sessions'); // Jump to managed screen to see accomplishments
  };

  // Modify existing session values
  const handleUpdateSession = (id: string, updatedFields: Partial<MatchSession>) => {
    if (!user) {
      return;
    }

    const newSessions = sessions.map((s) => {
      if (s.host.id !== user.id) {
        return s;
      }

      if (s.id === id) {
        return {
          ...s,
          ...updatedFields,
          // Recalculate max players safely
          maxPlayers: updatedFields.maxPlayers ?? s.maxPlayers
        };
      }
      return s;
    });

    setSessions(newSessions);
    localStorage.setItem('smash_sessions', JSON.stringify(newSessions));
    setEditingSession(null);
    setActiveScreen('sessions'); // Return to list view
  };

  // Remove hosted session permanently
  const handleCancelSession = (id: string) => {
    if (!user) {
      return;
    }

    const confirmMessage = "Are you sure you want to cancel and delete this court match session?";
    if (window.confirm && !window.confirm(confirmMessage)) {
      return;
    }

    const filtered = sessions.filter((s) => s.id !== id || s.host.id !== user.id);
    setSessions(filtered);
    localStorage.setItem('smash_sessions', JSON.stringify(filtered));
  };

  // Join slots on court match
  const handleJoinSession = (sessionId: string) => {
    if (!user) {
      return;
    }

    const playerToJoin: Player = {
      id: user.id,
      name: user.name,
      avatar: user.avatar
    };

    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        if (s.playersJoined.length >= s.maxPlayers) {
          return s; // Full, bypass
        }
        if (!s.playersJoined.some((p) => p.id === user.id)) {
          return { ...s, playersJoined: [...s.playersJoined, playerToJoin] };
        }
      }
      return s;
    });

    setSessions(updated);
    localStorage.setItem('smash_sessions', JSON.stringify(updated));
  };

  // Retire from court lineup
  const handleLeaveSession = (sessionId: string) => {
    if (!user) {
      return;
    }

    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        if (s.host.id === user.id) {
          return s;
        }

        return {
          ...s,
          playersJoined: s.playersJoined.filter((p) => p.id !== user.id)
        };
      }
      return s;
    });

    setSessions(updated);
    localStorage.setItem('smash_sessions', JSON.stringify(updated));
  };

  // Edit trigger
  const handleEditTrigger = (session: MatchSession) => {
    if (!user || session.host.id !== user.id) {
      return;
    }

    setEditingSession(session);
    setActiveScreen('host');
  };

  // Find currently active session details safely
  const currentDetailsSession = sessions.find((s) => s.id === selectedSessionId) || null;

  // Counts for sidebar and profiles
  const matchesCount = sessions.length;
  const myParticipatedMatchesCount = sessions.filter((s) => 
    user && s.playersJoined.some((p) => p.id === user.id)
  ).length;

  if (!user) {
    return <AuthScreen onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col relative antialiased pb-28 md:pb-6">
      {/* Universal header layout */}
      <Header
        user={user}
        onMenuClick={() => setIsSidebarOpen(true)}
        onProfileClick={() => {
          setEditingSession(null);
          setActiveScreen('profile');
        }}
        onLogoClick={() => {
          setEditingSession(null);
          setActiveScreen('explore');
        }}
      />

      {/* Slide Navigation Menu Sidebar */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setEditingSession(null);
          setActiveScreen(screen);
        }}
        onResetData={handleResetData}
        matchesCount={matchesCount}
      />

      {/* Main Container viewport */}
      <main className="flex-grow pt-20 px-4 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen + (selectedSessionId || '')}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            {activeScreen === 'explore' && (
              <ExploreScreen
                sessions={sessions}
                onSelectSession={(id) => {
                  setSelectedSessionId(id);
                  setActiveScreen('details');
                }}
                onNavigateToHost={() => {
                  setEditingSession(null);
                  setActiveScreen('host');
                }}
                currentUserId={user.id}
              />
            )}

            {activeScreen === 'host' && (
              <HostScreen
                onPostSession={handlePostSession}
                onUpdateSession={handleUpdateSession}
                editingSession={editingSession}
                onCancelEdit={() => {
                  setEditingSession(null);
                  setActiveScreen('sessions');
                }}
              />
            )}

            {activeScreen === 'sessions' && (
              <MySessions
                sessions={sessions}
                currentUserId={user.id}
                onEditSession={handleEditTrigger}
                onCancelSession={handleCancelSession}
                onNavigateToHost={() => {
                  setEditingSession(null);
                  setActiveScreen('host');
                }}
              />
            )}

            {activeScreen === 'details' && currentDetailsSession && (
              <SessionDetails
                session={currentDetailsSession}
                currentUser={user}
                onBack={() => setActiveScreen('explore')}
                onJoin={handleJoinSession}
                onLeave={handleLeaveSession}
              />
            )}

            {activeScreen === 'profile' && (
              <ProfileScreen
                user={user}
                onUpdateProfile={handleUpdateProfile}
                matchesPlayedCount={myParticipatedMatchesCount}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Universal Footer Nav bar matching responsive guidelines */}
      <BottomNav
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setEditingSession(null);
          setActiveScreen(screen);
        }}
      />
    </div>
  );
}
