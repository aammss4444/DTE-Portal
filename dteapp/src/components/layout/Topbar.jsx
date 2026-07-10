import { useSelector } from 'react-redux';
import { cn } from '../../utils/cn';

const Topbar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-foreground hidden md:block">
          Welcome, {user?.full_name}
        </h2>
      </div>
    </header>
  );
};

export default Topbar;
