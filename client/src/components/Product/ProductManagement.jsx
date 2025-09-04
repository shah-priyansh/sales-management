import { Package, Edit, Trash2, Plus, Search, Filter, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
    deleteProduct,
    fetchProducts,
    selectProducts,
    selectProductsError,
    selectProductsLoading,
    selectProductsPagination,
    setCurrentPage
} from '../../store/slices/productSlice';
import { formatDate } from '../../utils/authUtils';
import {
    Badge,
    Button,
    Card,
    CardContent,
    EmptyTable,
    LoadingTable,
    Pagination,
    SearchInput,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../ui';
import AddProductModal from './AddProductModal';

const ProductManagement = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const dispatch = useDispatch();
    const products = useSelector(selectProducts);
    const productsLoading = useSelector(selectProductsLoading);
    const productsError = useSelector(selectProductsError);
    const pagination = useSelector(selectProductsPagination);

    useEffect(() => {
        dispatch(fetchProducts({
            page: pagination.currentPage,
            search: searchTerm,
            isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
        }));
    }, [dispatch, pagination.currentPage, searchTerm, statusFilter]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        dispatch(setCurrentPage(1));
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        dispatch(setCurrentPage(1));
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (product) => {
        if (window.confirm(`Are you sure you want to delete "${product.productName}"?`)) {
            try {
                await dispatch(deleteProduct(product._id)).unwrap();
                toast.success('Product deleted successfully');
            } catch (error) {
                toast.error(error || 'Failed to delete product');
            }
        }
    };

    const handlePageChange = (page) => {
        dispatch(setCurrentPage(page));
    };

    const getStatusBadge = (isActive) => {
        return (
            <Badge variant={isActive ? 'success' : 'destructive'} >
                {isActive ? (
                    <>
                        Active
                    </>
                ) : (
                    <>
                        Inactive
                    </>
                )}
            </Badge>
        );
    };

    if (productsError) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-red-500">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Error: {productsError}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getStatsCards = () => {
        const totalProducts = pagination.total || products.length;
        const activeProducts = products.filter(p => p.status === 'Active').length;
        const inactiveProducts = products.filter(p => p.status === 'Inactive').length;

        return (
            <div className="grid grid-cols-1 sm:grid-co ls-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Products</p>
                                <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Inactive Products</p>
                                <p className="text-2xl font-bold text-gray-900">{inactiveProducts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>


            </div>
        );
    };
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            {getStatsCards()}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'active' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('active')}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Active
                            </Button>
                            <Button
                                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter('inactive')}
                                className="flex items-center gap-2"
                            >
                                <XCircle className="h-4 w-4" />
                                Inactive
                            </Button>
                        </div>
                        <Button onClick={() => setIsAddModalOpen(true)} variant="gradient" size="lg" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Button>

                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardContent className="p-0">
                    {productsLoading ? (
                        <LoadingTable />
                    ) : products.length === 0 ? (
                        <EmptyTable
                            icon={Package}
                            title="No products found"
                            description="Get started by adding your first product"
                            actionText="Add Product"
                            onAction={() => setIsAddModalOpen(true)}
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{product.productName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            {getStatusBadge(product.isActive)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(product.createdAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(product.updatedAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(product)}
                                                    className="hover:bg-gray-100 rounded"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(product)}
                                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {products.length > 0 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Modals */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
            <AddProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default ProductManagement;
