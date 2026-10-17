import { useEffect, useState } from 'react';

/*
  A tiny router based on the URL hash, e.g. "#/talk/greeting-lola?mode=test".
  Why the hash? It needs no server configuration, refreshing keeps you on the
  same page, and the browser's Back button works — without a router library.
*/

export function parseHash(hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const segments = path.split('/').filter(Boolean);
  return { path: '/' + segments.join('/'), segments, params: new URLSearchParams(query) };
}

export function navigate(to) {
  window.location.hash = to;
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
