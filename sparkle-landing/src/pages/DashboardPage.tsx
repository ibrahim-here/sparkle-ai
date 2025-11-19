import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <DashboardLayout user={user} />;
};

export default DashboardPage;
