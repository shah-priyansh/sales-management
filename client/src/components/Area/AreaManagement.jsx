import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, MapPin, Building2, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addArea, deleteArea, toggleAreaStatus, selectAreas } from '../../store/slices/areaSlice';
import AddAreaModal from './AddAreaModal';

const AreaManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const areas = useSelector(selectAreas);

  // Filter areas based on search
  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArea = (areaData) => {
    const newArea = {
      ...areaData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      isActive: areaData.isActive === 'true' || areaData.isActive === true
    };
    dispatch(addArea(newArea));
    setIsAddModalOpen(false);
  };

  const handleDeleteArea = (areaId) => {
    if (window.confirm('Are you sure you want to delete this area?')) {
      dispatch(deleteArea(areaId));
    }
  };

  const handleToggleStatus = (areaId) => {
    dispatch(toggleAreaStatus(areaId));
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Areas</p>
              <p className="text-2xl font-bold text-gray-900">{areas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Areas</p>
              <p className="text-2xl font-bold text-gray-900">
                {areas.filter(a => a.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cities Covered</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(areas.map(a => a.city)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Add Area
          </button>
        </div>
      </div>

      {/* Areas Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Area
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAreas.map((area) => (
              <tr key={area._id} className="hover:bg-gray-50 transition-colors">
                {/* Area Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {area.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {area._id.slice(-4)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* City */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{area.city}</span>
                  </div>
                </td>

                {/* Description */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {area.description || 'No description'}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(area._id)}
                    className="cursor-pointer"
                  >
                    {getStatusBadge(area.isActive)}
                  </button>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {area.createdAt}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="View area"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                      title="Edit area"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArea(area._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete area"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredAreas.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No areas found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new area.'}
            </p>
          </div>
        )}
      </div>

      {/* Add Area Modal */}
      <AddAreaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddArea}
      />
    </div>
  );
};

export default AreaManagement;
