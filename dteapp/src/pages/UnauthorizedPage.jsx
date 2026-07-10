import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Button } from '../components/common/UIComponents';
import { DASHBOARD_ROUTES } from '../constants/roles';

const UnauthorizedPage = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const normalizedRole = role?.toUpperCase();
  const hasKnownDashboard = normalizedRole && DASHBOARD_ROUTES[normalizedRole];
  const redirectPath = hasKnownDashboard ? DASHBOARD_ROUTES[normalizedRole] : '/login';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 text-center">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-4">Access Denied</h1>
      <p className="text-secondary max-w-md mb-8">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <Link to={redirectPath}>
        <Button variant="primary">
          {isAuthenticated && hasKnownDashboard ? 'Return to Dashboard' : 'Go to Login'}
        </Button>
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
