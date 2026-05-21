import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import TicketsPage from "./pages/TicketsPage";

function App() {
  const { logout } = useAuth();

  return (
    <PrivateRoute
      fallback={<LoginPage onSuccess={() => window.location.reload()} />}
    >
      <TicketsPage />
    </PrivateRoute>
  );
}

export default App;