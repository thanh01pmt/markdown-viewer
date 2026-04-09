import { TokenGate } from './components/TokenGate';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <TokenGate>
      <DashboardPage />
    </TokenGate>
  );
}
