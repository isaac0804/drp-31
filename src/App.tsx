import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchSession, UserProfile, Player } from './types';
import { signInWithGoogle, signOut, subscribeToCurrentUser, updateCurrentUser } from './auth';
import {
  subscribeToSessions,
  postSession,
  updateSession,
  cancelSession,
  joinSession,
  leaveSession,
  updateSessionsForPlayer,
} from './sessions';

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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<string>('explore'); // explore, host, sessions, details, profile
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<MatchSession | null>(null);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    return subscribeToSessions(setSessions, (err) => console.error('Sessions error:', err));
  }, []);

  useEffect(() => {
    return subscribeToCurrentUser((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      setAuthError(null);
    }, (error) => {
      setUser(null);
      setIsAuthLoading(false);
      setAuthError(error.message);
    });
  }, []);

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      setUser(await signInWithGoogle());
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Firebase sign-in failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!user) return;

    const newUser = { ...user, ...updated };
    try {
      await updateCurrentUser(newUser);
    } catch {
      return;
    }

    setUser(newUser);
    updateSessionsForPlayer(sessions, user.id, { name: newUser.name, avatar: newUser.avatar })
      .catch((err) => console.error('Session cascade error:', err));
  };

  const handleSignOut = async () => {
    await signOut();
    // onAuthStateChanged will fire with null and set user to null automatically
  };

  const handlePostSession = (newSessionData: Omit<MatchSession, 'id' | 'host' | 'playersJoined'>) => {
    if (!user) return;

    const hostPlayer: Player = { id: user.id, name: user.name, avatar: user.avatar };
    const finishedSession: MatchSession = {
      ...newSessionData,
      id: `session_${Date.now()}`,
      host: hostPlayer,
      playersJoined: [hostPlayer],
    };

    postSession(finishedSession).catch((err) => console.error('Post session error:', err));
    setActiveScreen('sessions');
  };

  const handleUpdateSession = (id: string, updatedFields: Partial<MatchSession>) => {
    if (!user) return;
    const session = sessions.find((s) => s.id === id);
    if (!session || session.host.id !== user.id) return;

    updateSession(id, updatedFields).catch((err) => console.error('Update session error:', err));
    setEditingSession(null);
    setActiveScreen('sessions');
  };

  const handleCancelSession = (id: string) => {
    if (!user) return;
    const session = sessions.find((s) => s.id === id);
    if (!session || session.host.id !== user.id) return;

    if (window.confirm && !window.confirm('Are you sure you want to cancel and delete this court match session?')) {
      return;
    }

    cancelSession(id).catch((err) => console.error('Cancel session error:', err));
  };

  const handleJoinSession = (sessionId: string) => {
    if (!user) return;
    const player: Player = { id: user.id, name: user.name, avatar: user.avatar };
    joinSession(sessionId, player).catch((err) => console.error('Join session error:', err));
  };

  const handleLeaveSession = (sessionId: string) => {
    if (!user) return;
    leaveSession(sessionId, user.id).catch((err) => console.error('Leave session error:', err));
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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center px-5 antialiased">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary-fixed/30 border-t-primary-fixed animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-on-surface-variant">
            Loading Peer Play
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSignIn={handleSignIn} error={authError} />;
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
        onSignOut={handleSignOut}
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
                onLeaveSession={handleLeaveSession}
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
