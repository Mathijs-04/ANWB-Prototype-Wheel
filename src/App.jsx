import { useEffect, useState } from 'react';
import Admin from './admin/Admin';
import Home from './Home';

function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  return hash.startsWith('#/admin') ? <Admin /> : <Home />;
}
