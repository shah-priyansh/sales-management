import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, MapPin, Building2, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addArea, deleteArea, toggleAreaStatus, selectAreas, fetchAreas, selectAreasLoading, selectAreasError, selectAreasPagination } from '../../store/slices/areaSlice';
import { Button, Input, Card, CardContent, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui';
import AddAreaModal from './AddAreaModal';
import { formatDate } from '../../utils/authUtils';

const AreaManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const areas = useSelector(selectAreas);
  const areasLoading = useSelector(selectAreasLoading);
  const areasError = useSelector(selectAreasError);
  const pagination = useSelector(selectAreasPagination);

  // Fetch areas on component mount and when search/page changes
  useEffect(() => {
    dispatch(fetchAreas({ 
      page: currentPage, 
      search: searchTerm,
      limit: 20 
    }));
  }, [dispatch, currentPage, searchTerm]);

  // Filter areas based on search (client-side filtering for better UX)
  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAreaSuccess = () => {
    // This function is called when area is successfully created via API
    console.log('Area created successfully via API');
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
      {/* Loading State */}
      {areasLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-gray-600">Loading areas...</div>
        </div>
      )}

      {/* Error State */}
      {areasError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">
            <strong>Error:</strong> {areasError}
          </div>
        </div>
      )}

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
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Area</TableHead>
                <TableHead>State</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areasLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">Loading areas...</div>
                  </TableCell>
                </TableRow>
              ) : filteredAreas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm ? 'No areas found matching your search.' : 'No areas found. Create your first area to get started.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAreas.map((area) => (
                <TableRow key={area._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {area.name}
                        </div>
                
                      </div>
                    </div>
                  </TableCell>

                  {/* State */}
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{area.state}</span>
                    </div>
                  </TableCell>

                  {/* City */}
                  <TableCell>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{area.city}</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(area.isActive, area._id)}
                  </TableCell>

                  {/* Created Date */}
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(area.createdAt)}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} areas
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Area Modal */}
      <AddAreaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddAreaSuccess}
      />
    </div>
  );
};

export default AreaManagement;
