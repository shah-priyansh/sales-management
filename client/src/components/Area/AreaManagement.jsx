import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, MapPin, Building2, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addArea, deleteArea, toggleAreaStatus, selectAreas } from '../../store/slices/areaSlice';
import { Button, Input, Card, CardContent, Badge } from '../ui';
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

  const getStatusBadge = (isActive, areaId) => {
    return (
      <Badge 
        variant={isActive ? "success" : "secondary"}
        className="cursor-pointer hover:opacity-80"
        onClick={() => handleToggleStatus(areaId)}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Area Management</h1>
        <p className="text-gray-600">Manage your sales territories and coverage areas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Areas</p>
                <p className="text-2xl font-bold text-gray-900">{areas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      </div>

      {/* Search and Add Button */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="gradient"
              size="lg"
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Area
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Areas Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
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
                       {getStatusBadge(area.isActive, area._id)}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                          title="View area"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                          title="Edit area"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteArea(area._id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                          title="Delete area"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </CardContent>
      </Card>

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
