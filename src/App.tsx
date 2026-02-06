import { useState } from 'react';
import { StorageProvider } from './contexts/StorageContext';
import HomeScreen from './screens/HomeScreen';
import CreateManualScreen from './screens/CreateManualScreen';
import ManualDetailScreen from './screens/ManualDetailScreen';
import './App.css';

type Screen = 'home' | 'create' | 'detail';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedManualId, setSelectedManualId] = useState<string | undefined>();

  const handleNavigate = (screen: Screen, manualId?: string) => {
    setCurrentScreen(screen);
    if (manualId) {
      setSelectedManualId(manualId);
    }
  };

  return (
    <StorageProvider>
      <div className="app-container">
        <header className="app-header">
          <h1>金属加工作業手順書管理</h1>
        </header>
        <main className="app-main">
          {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
          {currentScreen === 'create' && <CreateManualScreen onNavigate={handleNavigate} />}
          {currentScreen === 'detail' && selectedManualId && (
            <ManualDetailScreen manualId={selectedManualId} onNavigate={handleNavigate} />
          )}
        </main>
      </div>
    </StorageProvider>
  );
}

export default App;
