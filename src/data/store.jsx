import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createSeed, SEED_VERSION } from './seed';

const KEY = 'anwb-draai-verbind-data';
const DataContext = createContext(null);

function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === SEED_VERSION) return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  // first run or a new SEED_VERSION: start from the example data and store it right away
  const seed = createSeed();
  saveData(seed);
  return seed;
}

function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Opslaan mislukt', e);
    return false;
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState(loadData);
  const ref = useRef(data);

  const commit = useCallback((next) => {
    if (!saveData(next)) {
      alert("Opslaan is mislukt: de opslag van de browser is vol. Gebruik kleinere of minder foto's.");
      return false;
    }
    ref.current = next;
    setData(next);
    return true;
  }, []);

  /** update(draft => { mutate draft }) : works on a deep copy, then saves. */
  const update = useCallback(
    (fn) => {
      const draft = structuredClone(ref.current);
      const result = fn(draft);
      return commit(result ?? draft);
    },
    [commit],
  );

  const replace = useCallback((next) => commit(next), [commit]);
  const reset = useCallback(() => commit(createSeed()), [commit]);

  return <DataContext.Provider value={{ data, update, replace, reset }}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}

export { SEED_VERSION };
