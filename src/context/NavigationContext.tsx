import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRoute = 
  // Public
  | '/'
  | '/browse'
  | '/listing'
  | '/login'
  | '/register'
  | '/forgot-password'
  | '/reset-password'
  | '/verify-email'
  | '/safety'
  | '/terms'
  | '/privacy'
  | '/prohibited-items'
  // User (/app)
  | '/app'
  | '/app/listings'
  | '/app/listings/new'
  | '/app/offers'
  | '/app/trades'
  | '/app/messages'
  | '/app/favorites'
  | '/app/notifications'
  | '/app/profile'
  | '/app/settings'
  | '/app/settings/security'
  // Admin (/admin)
  | '/admin'
  | '/admin/users'
  | '/admin/listings'
  | '/admin/reports'
  | '/admin/trades'
  | '/admin/disputes'
  | '/admin/audit-logs'
  | '/admin/settings';

interface NavigationContextType {
  currentRoute: string;
  routeParam: string | null;
  navigate: (route: string, param?: string) => void;
  showCreateListing: boolean;
  setShowCreateListing: (show: boolean) => void;
  showProhibitedModal: boolean;
  setShowProhibitedModal: (show: boolean) => void;
  showBrandIntro: boolean;
  setShowBrandIntro: (show: boolean) => void;
  replayBrandIntro: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [routeParam, setRouteParam] = useState<string | null>(null);
  const [showCreateListing, setShowCreateListing] = useState<boolean>(false);
  const [showProhibitedModal, setShowProhibitedModal] = useState<boolean>(false);
  const [showBrandIntro, setShowBrandIntro] = useState<boolean>(() => {
    return !sessionStorage.getItem('barterly_intro_seen');
  });

  // Read URL hash on load and hash changes
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace('#', '') || '/';
      const cleanPath = rawHash.startsWith('/') ? rawHash : `/${rawHash}`;

      // Param extraction checks
      // 1. /listing/:id
      if (cleanPath.startsWith('/listing/')) {
        const id = cleanPath.replace('/listing/', '');
        setCurrentRoute('/listing');
        setRouteParam(id);
        return;
      }

      // 2. /app/offers/:id
      if (cleanPath.startsWith('/app/offers/')) {
        const id = cleanPath.replace('/app/offers/', '');
        setCurrentRoute('/app/offers');
        setRouteParam(id);
        return;
      }

      // 3. /app/trades/:id
      if (cleanPath.startsWith('/app/trades/')) {
        const id = cleanPath.replace('/app/trades/', '');
        setCurrentRoute('/app/trades');
        setRouteParam(id);
        return;
      }

      // 4. /app/messages/:id
      if (cleanPath.startsWith('/app/messages/')) {
        const id = cleanPath.replace('/app/messages/', '');
        setCurrentRoute('/app/messages');
        setRouteParam(id);
        return;
      }

      // 5. /app/profile/:id
      if (cleanPath.startsWith('/app/profile/')) {
        const id = cleanPath.replace('/app/profile/', '');
        setCurrentRoute('/app/profile');
        setRouteParam(id);
        return;
      }

      // 6. /admin/users/:id
      if (cleanPath.startsWith('/admin/users/')) {
        const id = cleanPath.replace('/admin/users/', '');
        setCurrentRoute('/admin/users');
        setRouteParam(id);
        return;
      }

      // 7. /admin/listings/:id
      if (cleanPath.startsWith('/admin/listings/')) {
        const id = cleanPath.replace('/admin/listings/', '');
        setCurrentRoute('/admin/listings');
        setRouteParam(id);
        return;
      }

      // 8. /admin/reports/:id
      if (cleanPath.startsWith('/admin/reports/')) {
        const id = cleanPath.replace('/admin/reports/', '');
        setCurrentRoute('/admin/reports');
        setRouteParam(id);
        return;
      }

      // 9. /admin/disputes/:id
      if (cleanPath.startsWith('/admin/disputes/')) {
        const id = cleanPath.replace('/admin/disputes/', '');
        setCurrentRoute('/admin/disputes');
        setRouteParam(id);
        return;
      }

      // Standard routes
      setCurrentRoute(cleanPath);
      setRouteParam(null);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (route: string, param?: string) => {
    let targetHash = route;

    if (param) {
      if (route.endsWith('/')) {
        targetHash = `${route}${param}`;
      } else {
        targetHash = `${route}/${param}`;
      }
      setRouteParam(param);
    } else {
      setRouteParam(null);
    }

    setCurrentRoute(route);
    window.location.hash = targetHash === '/' ? '' : targetHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const replayBrandIntro = () => {
    setShowBrandIntro(true);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        routeParam,
        navigate,
        showCreateListing,
        setShowCreateListing,
        showProhibitedModal,
        setShowProhibitedModal,
        showBrandIntro,
        setShowBrandIntro,
        replayBrandIntro,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
