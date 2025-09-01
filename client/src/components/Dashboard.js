import React, { useEffect } from 'react';
import { fetchDashboardData, selectDashboardStats, selectRecentSalesmen, selectRecentClients, selectDashboardLoading } from '../store/slices/dashboardSlice';
import { selectUser } from '../store/slices/authSlice';
import { Users, UserCheck, MapPin, TrendingUp, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const stats = useSelector(selectDashboardStats);
  const recentSalesmen = useSelector(selectRecentSalesmen);
  const recentClients = useSelector(selectRecentClients);
  const loading = useSelector(selectDashboardLoading);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold text-${color}-900`}>{value}</p>
        </div>
      </div>
    </div>
  );

  const RecentItem = ({ title, subtitle, time, status }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {title.charAt(0)}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <Clock className="h-4 w-4 mr-1" />
        {time}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Salesmen"
          value={stats?.totalSalesmen || 0}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Total Areas"
          value={stats?.totalAreas || 0}
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats?.totalSalesmen || 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Salesmen */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Salesmen</h3>
          <div className="space-y-2">
            {recentSalesmen && recentSalesmen.length > 0 ? (
              recentSalesmen.map((salesman, index) => (
                <RecentItem
                  key={salesman._id}
                  title={`${salesman.firstName} ${salesman.lastName}`}
                  subtitle={salesman.area?.name || 'No area assigned'}
                  time={new Date(salesman.lastLogin).toLocaleDateString()}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent salesmen activity</p>
            )}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Clients</h3>
          <div className="space-y-2">
            {recentClients && recentClients.length > 0 ? (
              recentClients.map((client, index) => (
                <RecentItem
                  key={client._id}
                  title={client.name}
                  subtitle={`${client.company || 'No company'} • ${client.area?.name}`}
                  time={new Date(client.createdAt).toLocaleDateString()}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent client activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <Users className="h-5 w-5 mr-2" />
            Add New Salesman
          </button>
          <button className="btn-primary flex items-center justify-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Add New Client
          </button>
          <button className="btn-primary flex items-center justify-center">
            <MapPin className="h-5 w-5 mr-2" />
            Add New Area
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
