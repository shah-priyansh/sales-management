import { Building2, Calendar, Edit, Eye, MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteArea, fetchAreas, selectAreas, selectAreasError, selectAreasLoading, selectAreasPagination, toggleAreaStatus } from '../../store/slices/areaSlice';
import { formatDate } from '../../utils/authUtils';
import { Badge, Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination, LoadingTable, EmptyTable, ErrorTable, SearchInput } from '../ui';
import AddAreaModal from './AddAreaModal';

const AreaManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();
  const areas = useSelector(selectAreas);
  const areasLoading = useSelector(selectAreasLoading);
  const areasError = useSelector(selectAreasError);
  const pagination = useSelector(selectAreasPagination);

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchTerm, debouncedSearchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);

  // Fetch areas on component mount and when debounced search/page changes
  useEffect(() => {
    dispatch(fetchAreas({ 
      page: currentPage, 
      search: debouncedSearchTerm,
      limit: 20 
    }));
  }, [dispatch, currentPage, debouncedSearchTerm]);

  const handleAddAreaSuccess = () => {
    // This function is called when area is successfully created via API
    console.log('Area created successfully via API');
    setIsAddModalOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(1);
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
    <div className="max-w-full">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
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
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={handleClearSearch}
              placeholder="Search areas..."
              loading={areasLoading}
              searching={isSearching}
            />
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
        <CardContent className="p-0 overflow-auto h-[440px]">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <Table className="w-full table-fixed">
              <TableHeader className="sticky top-0">
                <TableRow>
                  <TableHead className="w-[25%]">Area</TableHead>
                  <TableHead className="w-[15%]">State</TableHead>
                  <TableHead className="w-[15%]">City</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[20%]">Created</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {areasLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <LoadingTable columns={6} rows={5} className="border-0" />
                  </TableCell>
                </TableRow>
              ) : areasError ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <ErrorTable 
                      columns={6} 
                      message="Failed to load areas"
                      description="There was an error loading the areas. Please try again."
                      onRetry={() => dispatch(fetchAreas({ page: currentPage, search: debouncedSearchTerm, limit: 20 }))}
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              ) : areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyTable 
                      columns={6}
                      message={debouncedSearchTerm ? 'No areas found' : 'No areas yet'}
                      description={debouncedSearchTerm ? 'No areas match your search criteria.' : 'Create your first area to get started.'}
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                areas.map((area) => (
                <TableRow key={area._id}>
                  <TableCell className="font-medium">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {area.name}
                    </div>
                  </TableCell>

                  {/* State */}
                  <TableCell>
                    <span className="text-sm text-gray-900 truncate">{area.state}</span>
                  </TableCell>

                  {/* City */}
                  <TableCell>
                    <span className="text-sm text-gray-900 truncate">{area.city}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(area.isActive, area._id)}
                  </TableCell>

                  {/* Created Date */}
                  <TableCell>
                    <span className="text-sm text-gray-900 truncate">{formatDate(area.createdAt)}</span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        title="View area"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                        title="Edit area"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteArea(area._id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-900 hover:bg-red-50"
                        title="Delete area"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-0">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setCurrentPage}
              loading={areasLoading}
            />
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
