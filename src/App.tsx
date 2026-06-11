import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveScreen, MatchSession, Review, HostReview, UserProfile, Player, Sport } from './types';
import { signInWithGoogle, signOut, subscribeToCurrentUser, updateCurrentUser, getUserProfileById } from './auth';
import { DEFAULT_USER } from './data';
import {
  subscribeToSessions,
  postSession,
  updateSession,
  cancelSession,
  joinSession,
  leaveSession,
  updateSessionsForPlayer,
} from './sessions';
import { getReviewsForPlayer, getHostReviewsForPlayer, getAllReviewsByUser } from './reviews';
import { seedDummySessions, unseedDummySessions } from './devSeed';

// Component imports
import Header from './components/Header';
import SidebarDrawer from './components/SidebarDrawer';
import BottomNav from './components/BottomNav';
import ExploreScreen, { ExploreFilters, DEFAULT_EXPLORE_FILTERS } from './components/ExploreScreen';
import HostScreen from './components/HostScreen';
import MySessions from './components/MySessions';
import SessionDetails from './components/SessionDetails';
import ProfileScreen from './components/ProfileScreen';
import PlayerProfileScreen from './components/PlayerProfileScreen';
import PlayerReviewsScreen from './components/PlayerReviewsScreen';
import HostReviewsScreen from './components/HostReviewsScreen';
import AuthScreen from './components/AuthScreen';
import SkillAssessmentScreen from './components/SkillAssessmentScreen';
import ReviewsScreen from './components/ReviewsScreen';
import ChatScreen from './components/ChatScreen';
import ChatsListScreen from './components/ChatsListScreen';


export default function App() {
  const [sessions, setSessions] = useState<MatchSession[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('explore');
  const [screenHistory, setScreenHistory] = useState<ActiveScreen[]>([]);

  const pushNav = (screen: ActiveScreen) => {
    setScreenHistory((h) => [...h, activeScreen]);
    setActiveScreen(screen);
  };

  const goBack = () => {
    const prev = screenHistory[screenHistory.length - 1] ?? 'explore';
    setScreenHistory((h) => h.slice(0, -1));
    setActiveScreen(prev);
  };

  const rootNav = (screen: ActiveScreen) => {
    setScreenHistory([]);
    setActiveScreen(screen);
  };
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionPlayerStats, setSessionPlayerStats] = useState<Record<string, { wouldPlayAgain: number | null; skillAccuracy: number | null; reviewCount: number; hostRating: number | null; hostReviewCount: number }>>({});
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<UserProfile | null>(null);
  const [selectedPlayerMatchesCount, setSelectedPlayerMatchesCount] = useState(0);
  const [selectedPlayerReviews, setSelectedPlayerReviews] = useState<Review[]>([]);
  const [selectedPlayerHostReviews, setSelectedPlayerHostReviews] = useState<HostReview[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [myReviewedItems, setMyReviewedItems] = useState<{ sessionId: string; revieweeId: string; isHostReview: boolean }[]>([]);
  const [editingSession, setEditingSession] = useState<MatchSession | null>(null);
  const [exploreViewMode, setExploreViewMode] = useState<'list' | 'map'>('list');
  const [exploreFilters, setExploreFilters] = useState<ExploreFilters>(DEFAULT_EXPLORE_FILTERS);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  // Invite link: ?invite=<sessionId> in the URL
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('invite');
  });

  useEffect(() => {
    return subscribeToSessions(setSessions, (err) => console.error('Sessions error:', err));
  }, []);

  useEffect(() => {
    if (!pendingInviteId || sessions.length === 0) return;
    const session = sessions.find((s) => s.id === pendingInviteId);
    if (session) {
      setSelectedSessionId(pendingInviteId);
      setActiveScreen('details');
      setPendingInviteId(null);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [pendingInviteId, sessions]);

  useEffect(() => {
    return subscribeToCurrentUser((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      setAuthError(null);
      if (currentUser && !currentUser.skillsBySport || (currentUser && Object.keys(currentUser.skillsBySport ?? {}).length === 0)) setActiveScreen('assessment');
      if (currentUser) {
        getReviewsForPlayer(currentUser.id).then(setMyReviews).catch(console.error);
        getAllReviewsByUser(currentUser.id).then(setMyReviewedItems).catch(console.error);
      } else {
        setMyReviews([]);
        setMyReviewedItems([]);
      }
    }, (error) => {
      setUser(null);
      setIsAuthLoading(false);
      setAuthError(error.message);
    });
  }, []);

  // Dev-only: expose dummy-session seeders on the console, bound to the live
  // signed-in account so the sessions are hosted by the real user.
  // Run `seedDummySessions()` / `unseedDummySessions()` from the browser console.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    if (user) {
      const host: Player = { id: user.id, name: user.name, avatar: user.avatar };
      w.seedDummySessions = () => seedDummySessions(host);
      w.unseedDummySessions = () => unseedDummySessions();
    } else {
      delete w.seedDummySessions;
      delete w.unseedDummySessions;
    }
  }, [user]);

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

  const handleAssessmentComplete = async (sport: Sport, skillLevel: UserProfile['skillLevel']) => {
    await handleUpdateProfile({
      skillsBySport: { ...(user?.skillsBySport ?? {}), [sport]: { skillLevel } },
      skillLevel,
    });
    rootNav('explore');
  };

  const handleSignOut = async () => {
    await signOut();
    // onAuthStateChanged will fire with null and set user to null automatically
  };

  const handlePostSession = (newSessionData: Omit<MatchSession, 'host' | 'playersJoined'>) => {
    if (!user) return;

    const hostPlayer: Player = { id: user.id, name: user.name, avatar: user.avatar };
    const finishedSession: MatchSession = {
      ...newSessionData,
      host: hostPlayer,
      playersJoined: newSessionData.hostJoinsAsPlayer !== false ? [hostPlayer] : [],
    };

    postSession(finishedSession).catch((err) => console.error('Post session error:', err));
    rootNav('sessions');
  };

  const handleUpdateSession = (id: string, updatedFields: Partial<MatchSession>) => {
    if (!user) return;
    const session = sessions.find((s: MatchSession) => s.id === id);
    if (!session || session.host.id !== user.id) return;

    let fields = updatedFields;
    if ('hostJoinsAsPlayer' in updatedFields) {
      const hostPlayer: Player = { id: user.id, name: user.name, avatar: user.avatar };
      const wasJoined = session.playersJoined.some((p: Player) => p.id === user.id);
      const willJoin = updatedFields.hostJoinsAsPlayer !== false;
      if (wasJoined && !willJoin) {
        fields = { ...fields, playersJoined: session.playersJoined.filter((p: Player) => p.id !== user.id) };
      } else if (!wasJoined && willJoin) {
        fields = { ...fields, playersJoined: [hostPlayer, ...session.playersJoined] };
      }
    }

    updateSession(id, fields).catch((err) => console.error('Update session error:', err));
    setEditingSession(null);
    setSelectedSessionId(id);
    setActiveScreen('details');
  };

  const handleCancelSession = (id: string) => {
    if (!user) return;
    const session = sessions.find((s: MatchSession) => s.id === id);
    if (!session || session.host.id !== user.id) return;

    if (window.confirm && !window.confirm('Are you sure you want to cancel and delete this court match session?')) {
      return;
    }

    cancelSession(id).catch((err) => console.error('Cancel session error:', err));
  };

  const handleJoinSession = (sessionId: string) => {
    if (!user) return;
    const session = sessions.find((s) => s.id === sessionId);
    const sportSkill = session ? user.skillsBySport?.[session.sport] : undefined;
    const player: Player = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      skillLevel: sportSkill?.skillLevel ?? user.skillLevel,
    };
    joinSession(sessionId, player).catch((err) => console.error('Join session error:', err));
  };

  const handleLeaveSession = (sessionId: string) => {
    if (!user) return;
    leaveSession(sessionId, user.id).catch((err) => console.error('Leave session error:', err));
  };

  const handleViewPlayerProfile = async (player: Player) => {
    const fallbackProfile: UserProfile = {
      ...DEFAULT_USER,
      id: player.id,
      name: player.name,
      avatar: player.avatar,
    };
    setSelectedPlayerProfile(fallbackProfile);
    setSelectedPlayerReviews([]);
    setSelectedPlayerHostReviews([]);
    setSelectedPlayerMatchesCount(
      sessions.filter((session: MatchSession) =>
        session.host.id === player.id || session.playersJoined.some((joinedPlayer: Player) => joinedPlayer.id === player.id)
      ).length
    );
    pushNav('player-profile');

    try {
      const storedProfile = await getUserProfileById(player.id);
      if (storedProfile) setSelectedPlayerProfile(storedProfile);
    } catch (error) {
      console.error('Player profile lookup error:', error);
    }

    try {
      const reviews = await getReviewsForPlayer(player.id);
      setSelectedPlayerReviews(reviews);
    } catch (error) {
      console.error('Reviews fetch error:', error);
    }

    try {
      const hostReviews = await getHostReviewsForPlayer(player.id);
      setSelectedPlayerHostReviews(hostReviews);
    } catch (error) {
      console.error('Host reviews fetch error:', error);
    }
  };

  const handleOpenChat = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    pushNav('session-chat');
  };

  const handleReviewSubmitted = (sessionId: string, revieweeId: string, isHostReview: boolean) => {
    setMyReviewedItems((prev) => [...prev, { sessionId, revieweeId, isHostReview }]);
  };

  // Edit trigger
  const handleEditTrigger = (session: MatchSession) => {
    if (!user || session.host.id !== user.id) {
      return;
    }

    setEditingSession(session);
    pushNav('host');
  };

  useEffect(() => {
    const session = sessions.find((s) => s.id === selectedSessionId);
    if (!session) return;
    // Always include the host so their rating shows even when not playing
    const playerMap = new Map<string, Player>(session.playersJoined.map((p: Player) => [p.id, p]));
    if (!playerMap.has(session.host.id)) playerMap.set(session.host.id, session.host);
    const players = Array.from(playerMap.values());
    Promise.all(players.map((p: Player) =>
      Promise.all([getReviewsForPlayer(p.id), getHostReviewsForPlayer(p.id)])
        .then(([reviews, hostReviews]) => ({ id: p.id, reviews, hostReviews }))
    )).then((results) => {
      const stats: Record<string, { wouldPlayAgain: number | null; skillAccuracy: number | null; reviewCount: number; hostRating: number | null; hostReviewCount: number }> = {};
      for (const { id, reviews, hostReviews } of results) {
        const playAgainYes = reviews.filter((r: Review) => r.playAgain === 'yes').length;
        const accurateCount = reviews.filter((r: Review) => r.skillAccuracy === 'accurate').length;
        const avgHostStars = hostReviews.length > 0
          ? hostReviews.reduce((sum: number, r: HostReview) => sum + r.starRating, 0) / hostReviews.length
          : null;
        stats[id] = {
          wouldPlayAgain: reviews.length > 0 ? parseFloat(((playAgainYes / reviews.length) * 5).toFixed(1)) : null,
          skillAccuracy: reviews.length > 0 ? parseFloat(((accurateCount / reviews.length) * 5).toFixed(1)) : null,
          reviewCount: reviews.length,
          hostRating: avgHostStars !== null ? parseFloat(avgHostStars.toFixed(1)) : null,
          hostReviewCount: hostReviews.length,
        };
      }
      setSessionPlayerStats(stats);
    }).catch(console.error);
  }, [selectedSessionId, sessions]);

  // Find currently active session details safely
  const currentDetailsSession = sessions.find((s) => s.id === selectedSessionId) || null;

  // Review banner — dismissed for 24 h after user taps ✕
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    const until = localStorage.getItem('review-banner-dismissed-until');
    return until ? Date.now() < Number(until) : false;
  });
  const dismissBanner = () => {
    localStorage.setItem('review-banner-dismissed-until', String(Date.now() + 86_400_000));
    setBannerDismissed(true);
  };

  // Counts for sidebar and profiles
  const matchesCount = sessions.length;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isSessionFinished = (s: { date: string; timeEnd: string }) => {
    if (s.date > todayStr) return false;
    if (s.date === todayStr) {
      const [endH, endM] = s.timeEnd.split(':').map(Number);
      return endH < now.getHours() || (endH === now.getHours() && endM <= now.getMinutes());
    }
    return true;
  };
  const myParticipatedMatchesCount = sessions.filter((s) =>
    user && s.playersJoined.some((p: Player) => p.id === user.id) && isSessionFinished(s)
  ).length;
  const pendingReviewCount = sessions.filter((s) => {
    if (!user) return false;
    const isParticipant = s.host.id === user.id || s.playersJoined.some((p: Player) => p.id === user.id);
    if (!isParticipant || !isSessionFinished(s)) return false;
    const playerReviewedIds = new Set(
      myReviewedItems.filter((r) => r.sessionId === s.id && !r.isHostReview).map((r) => r.revieweeId)
    );
    const hasReviewedHost = myReviewedItems.some((r) => r.sessionId === s.id && r.isHostReview);
    const reviewablePlayers = s.playersJoined.filter((p: Player) => p.id !== user.id);
    const allPlayersReviewed = reviewablePlayers.length === 0 || reviewablePlayers.every((p: Player) => playerReviewedIds.has(p.id));
    const needsHostReview = s.host.id !== user.id;
    return !allPlayersReviewed || (needsHostReview && !hasReviewedHost);
  }).length;

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
        onNavigate={(screen) => { setEditingSession(null); rootNav(screen); }}
        onSignOut={handleSignOut}
        pendingReviewCount={pendingReviewCount}
        onLogoClick={() => {
          setEditingSession(null);
          setExploreViewMode('list');
          rootNav('explore');
        }}
      />

      {/* Slide Navigation Menu Sidebar */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setEditingSession(null);
          if (screen === 'explore') setExploreViewMode('list');
          rootNav(screen);
        }}
        onSignOut={handleSignOut}
        onRetakeAssessment={() => pushNav('assessment')}
        matchesCount={matchesCount}
      />

      {/* Main Container viewport */}
      <main className="flex-grow pt-20 px-4 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen + (selectedSessionId || '')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            {activeScreen === 'explore' && (
              <ExploreScreen
                sessions={sessions}
                onSelectSession={(id) => {
                  setSelectedSessionId(id);
                  pushNav('details');
                }}
                onNavigateToHost={() => {
                  setEditingSession(null);
                  pushNav('host');
                }}
                currentUserId={user.id}
                viewMode={exploreViewMode}
                onViewModeChange={setExploreViewMode}
                filters={exploreFilters}
                onFiltersChange={setExploreFilters}
                userGender={user.gender}
              />
            )}

            {activeScreen === 'host' && (
              <HostScreen
                onPostSession={handlePostSession}
                onUpdateSession={handleUpdateSession}
                editingSession={editingSession}
                hostGender={user.gender}
                onCancelEdit={() => {
                  setEditingSession(null);
                  goBack();
                }}
              />
            )}

            {activeScreen === 'sessions' && (
              <MySessions
                sessions={sessions}
                currentUserId={user.id}
                reviewerName={user.name}
                reviewerAvatar={user.avatar}
                onEditSession={handleEditTrigger}
                onCancelSession={handleCancelSession}
                onLeaveSession={handleLeaveSession}
                onNavigateToHost={() => {
                  setEditingSession(null);
                  pushNav('host');
                }}
                onSelectSession={(id) => {
                  setSelectedSessionId(id);
                  pushNav('details');
                }}
              />
            )}

            {activeScreen === 'details' && currentDetailsSession && (
              <SessionDetails
                session={currentDetailsSession}
                currentUser={user}
                onBack={goBack}
                onJoin={handleJoinSession}
                onLeave={handleLeaveSession}
                onViewPlayerProfile={handleViewPlayerProfile}
                onEdit={handleEditTrigger}
                onOpenChat={handleOpenChat}
                playerStats={sessionPlayerStats}
              />
            )}

            {activeScreen === 'session-chat' && currentDetailsSession && (
              <ChatScreen
                session={currentDetailsSession}
                currentUser={user}
                onBack={goBack}
              />
            )}

            {activeScreen === 'player-profile' && selectedPlayerProfile && (
              <PlayerProfileScreen
                profile={selectedPlayerProfile}
                matchesPlayedCount={selectedPlayerMatchesCount}
                reviews={selectedPlayerReviews}
                hostReviews={selectedPlayerHostReviews}
                onBack={goBack}
                onViewReviews={() => pushNav('player-reviews')}
                onViewHostReviews={() => pushNav('host-reviews')}
              />
            )}

            {activeScreen === 'player-reviews' && selectedPlayerProfile && (
              <PlayerReviewsScreen
                playerName={selectedPlayerProfile.name}
                reviews={selectedPlayerReviews}
                onBack={goBack}
              />
            )}

            {activeScreen === 'host-reviews' && selectedPlayerProfile && (
              <HostReviewsScreen
                playerName={selectedPlayerProfile.name}
                reviews={selectedPlayerHostReviews}
                onBack={goBack}
              />
            )}

            {activeScreen === 'profile' && (
              <ProfileScreen
                user={user}
                onUpdateProfile={handleUpdateProfile}
                matchesPlayedCount={myParticipatedMatchesCount}
                onRetakeAssessment={() => pushNav('assessment')}
                reviews={myReviews}
              />
            )}

            {activeScreen === 'assessment' && (
              <SkillAssessmentScreen
                onComplete={handleAssessmentComplete}
                onClose={goBack}
              />
            )}

            {activeScreen === 'reviews' && (
              <ReviewsScreen
                sessions={sessions}
                currentUserId={user.id}
                reviewerName={user.name}
                reviewerAvatar={user.avatar}
                onReviewSubmitted={handleReviewSubmitted}
              />
            )}

            {activeScreen === 'chats' && (
              <ChatsListScreen
                sessions={sessions}
                currentUser={user}
                onOpenChat={(sessionId) => {
                  setSelectedSessionId(sessionId);
                  pushNav('session-chat');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Review nudge banner — shown above nav when there are pending reviews */}
      <AnimatePresence>
        {pendingReviewCount > 0 && !bannerDismissed && activeScreen !== 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-[84px] left-0 right-0 mx-4 z-50 md:hidden"
          >
            <div className="bg-primary-fixed text-on-primary-fixed rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_4px_24px_rgba(202,243,0,0.25)]">
              <div className="w-8 h-8 rounded-full bg-on-primary-fixed/15 flex items-center justify-center shrink-0">
                <span className="font-black text-sm">{pendingReviewCount}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">Rate your teammates!</p>
                <p className="text-xs opacity-60 mt-0.5">
                  {pendingReviewCount} session{pendingReviewCount > 1 ? 's' : ''} waiting for your review.
                </p>
              </div>
              <button
                onClick={() => { dismissBanner(); rootNav('reviews'); }}
                className="shrink-0 font-bold text-xs uppercase tracking-wider bg-on-primary-fixed/15 hover:bg-on-primary-fixed/25 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Review
              </button>
              <button
                onClick={dismissBanner}
                className="shrink-0 text-on-primary-fixed/50 hover:text-on-primary-fixed transition-colors cursor-pointer text-lg leading-none"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Footer Nav bar matching responsive guidelines */}
      <BottomNav
        activeScreen={activeScreen}
        pendingReviewCount={pendingReviewCount}
        onNavigate={(screen) => {
          setEditingSession(null);
          if (screen === 'explore') setExploreViewMode('list');
          rootNav(screen);
        }}
      />
    </div>
  );
}
