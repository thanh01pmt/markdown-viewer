import { AuthGate } from './components/AuthGate';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <AuthGate>
      <DashboardPage />
    </AuthGate>
  );
}
