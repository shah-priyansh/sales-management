import React, { useEffect, useState } from 'react';
import { Users, UserCheck, MapPin, TrendingUp, Clock, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../store/slices/authSlice';
import { 
  fetchDashboardData, 
  selectDashboardStats, 
  selectRecentSalesmen, 
  selectRecentClients, 
  selectDashboardLoading, 
  selectDashboardError 
} from '../store/slices/dashboardSlice';
import { Card, CardContent } from './ui';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const stats = useSelector(selectDashboardStats);
  const recentSalesmen = useSelector(selectRecentSalesmen);
  const recentClients = useSelector(selectRecentClients);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

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

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RecentItem = ({ title, subtitle, time, status }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
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

  const handleQuickAction = (action) => {
    switch (action) {
      case 'salesman':
        navigate('/employees');
        break;
      case 'client':
        navigate('/clients');
        break;
      case 'area':
        navigate('/areas');
        break;
      default:
        break;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard data</p>
          <button 
            onClick={() => dispatch(fetchDashboardData())}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
  
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Salesmen</h3>
            <div className="space-y-2">
              {recentSalesmen.length > 0 ? (
                recentSalesmen.map((salesman) => (
                  <RecentItem
                    key={salesman._id}
                    title={`${salesman.firstName} ${salesman.lastName}`}
                    subtitle={salesman.area?.name || 'No area assigned'}
                    time={new Date(salesman.createdAt).toLocaleDateString()}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent salesmen activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Clients</h3>
            <div className="space-y-2">
              {recentClients.length > 0 ? (
                recentClients.map((client) => (
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-row gap-4 max-w-full">
            <button 
              onClick={() => handleQuickAction('salesman')}
              className="group relative overflow-hidden bg-white border-2 border-blue-200 rounded-xl p-3 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800 text-sm">Add Salesman</h4>
                  <p className="text-xs text-gray-500">Create new team member</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('client')}
              className="group relative overflow-hidden bg-white border-2 border-purple-200 rounded-xl p-3 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800 text-sm">Add Client</h4>
                  <p className="text-xs text-gray-500">Register new customer</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('area')}
              className="group relative overflow-hidden bg-white border-2 border-green-200 rounded-xl p-3 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800 text-sm">Add Area</h4>
                  <p className="text-xs text-gray-500">Define new territory</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
