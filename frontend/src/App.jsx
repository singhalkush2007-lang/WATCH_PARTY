import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, MotionConfig, AnimatePresence } from 'motion/react';
import { CurtainIntro, Scene } from './components/motion/Motion';
import { usePointerEffects } from './hooks/usePointerEffects';
import DashboardLayout from './components/layout/DashboardLayout';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import MyRoomsPage from './pages/MyRoomsPage';
import FriendsPage from './pages/FriendsPage';
import SettingsPage from './pages/SettingsPage';

// Bigger pages load their code only when you open them (the room brings the video player)
const WatchRoomPage = lazy(() => import('./pages/room/WatchRoomPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

// Shown for a moment while a page's code loads
function PageLoading() {
  return (
    <div className="page-loading" role="status">
      <span className="screen-state-shimmer" aria-hidden="true" />
      <span className="caption">Dimming the lights</span>
    </div>
  );
}

// Design-system reference page: only exists while developing (npm run dev)
const Styleguide = import.meta.env.DEV ? lazy(() => import('./pages/Styleguide')) : null;

// Dashboard pages share one scene, so the sidebar stays still and only the content cross-fades
const LOBBY_PATHS = ['/', '/discover', '/rooms', '/friends'];

function AppRoutes() {
  const location = useLocation();
  usePointerEffects();
  const sceneKey = LOBBY_PATHS.includes(location.pathname) ? 'lobby' : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Scene key={sceneKey}>
        <Routes location={location}>
          {/* Dashboard pages share one layout (sidebar + top bar). URLs are unchanged. */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/rooms" element={<MyRoomsPage />} />
            <Route path="/friends" element={<FriendsPage />} />
          </Route>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/room/:roomId" element={<Suspense fallback={<PageLoading />}><WatchRoomPage /></Suspense>} />
          {/* New pages: the existing routes above are unchanged */}
          <Route path="/welcome" element={<Suspense fallback={<PageLoading />}><LandingPage /></Suspense>} />
          <Route path="/signin" element={<Suspense fallback={<PageLoading />}><AuthPage mode="signin" /></Suspense>} />
          <Route path="/signup" element={<Suspense fallback={<PageLoading />}><AuthPage mode="signup" /></Suspense>} />
          {Styleguide && (
            <Route path="/styleguide" element={<Suspense fallback={null}><Styleguide /></Suspense>} />
          )}
        </Routes>
      </Scene>
    </AnimatePresence>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <BrowserRouter>
          <CurtainIntro />
          <AppRoutes />
        </BrowserRouter>
      </LazyMotion>
    </MotionConfig>
  );
}

export default App;
