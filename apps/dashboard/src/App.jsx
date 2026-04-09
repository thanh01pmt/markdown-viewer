import React from 'react';
import { TokenGate } from './components/TokenGate';
import DashboardPage from './pages/DashboardPage';
import './index.css';

function App() {
  return (
    <TokenGate>
      <DashboardPage />
    </TokenGate>
  );
}

export default App;
