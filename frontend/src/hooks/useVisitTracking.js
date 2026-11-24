import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordVisit } from '../services/api.js';

const KEY = 'hrr-visitor-id';

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

// A random ID kept in this browser so repeat page views count as one visitor. It identifies nobody.
function getVisitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = newId();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (e.g. some private modes): count the view with a one-off ID.
    return newId();
  }
}

let lastSent = '';

export default function useVisitTracking() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Skip the duplicate effect run from React StrictMode in development.
    if (pathname === lastSent) return;
    lastSent = pathname;
    recordVisit(getVisitorId(), pathname);
  }, [pathname]);
}
