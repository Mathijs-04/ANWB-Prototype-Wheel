import { useState } from 'react';
import logo from '../assets/anwb-logo.png';
import ActivitiesAdmin from './ActivitiesAdmin';
import CategoriesAdmin from './CategoriesAdmin';
import PeopleAdmin from './PeopleAdmin';
import ProfileQuestionsAdmin from './ProfileQuestionsAdmin';
import SettingsAdmin from './SettingsAdmin';

const TABS = [
  { id: 'people', label: "Collega's", Component: PeopleAdmin },
  { id: 'pq', label: 'Dit-of-dat', Component: ProfileQuestionsAdmin },
  { id: 'activities', label: 'Activiteiten', Component: ActivitiesAdmin },
  { id: 'categories', label: 'Categorieën', Component: CategoriesAdmin },
  { id: 'settings', label: 'Instellingen & data', Component: SettingsAdmin },
];

export default function Admin() {
  const [tab, setTab] = useState(() => {
    try {
      return sessionStorage.getItem('admin-tab') || 'people';
    } catch {
      return 'people';
    }
  });
  const current = TABS.find((t) => t.id === tab) || TABS[0];

  function choose(id) {
    setTab(id);
    try {
      sessionStorage.setItem('admin-tab', id);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="admin">
      <header className="adm-top">
        <img src={logo} alt="ANWB" />
        <h1>Beheer</h1>
        <nav className="adm-tabs">
          {TABS.map((t) => (
            <button type="button" key={t.id} className={`adm-tab ${t.id === current.id ? 'active' : ''}`} onClick={() => choose(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <a className="adm-back" href="#/">
          ← Naar het rad
        </a>
      </header>
      <main className="adm-main">
        <current.Component />
      </main>
    </div>
  );
}
