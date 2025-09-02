import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, MapPin, Shield, Search, X } from 'lucide-react';
import { fetchAreas, selectAreas, selectAreasLoading, selectAreasError } from '../../store/slices/areaSlice';
import { createUserFetch, selectUsersLoading, selectUsersError } from '../../store/slices/userSlice';
import toast from 'react-hot-toast';
import { Button, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Card, CardContent, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState('salesman');
  const [selectedArea, setSelectedArea] = useState('');
  const [areaSearchTerm, setAreaSearchTerm] = useState('');
  const [debouncedAreaSearch, setDebouncedAreaSearch] = useState('');
  const dispatch = useDispatch();
  const areas = useSelector(selectAreas);
  const areasLoading = useSelector(selectAreasLoading);
  const areasError = useSelector(selectAreasError);
  const usersLoading = useSelector(selectUsersLoading);
  const usersError = useSelector(selectUsersError);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  // Fetch areas when modal opens
  useEffect(() => {
    if (isOpen && areas.length === 0) {
      dispatch(fetchAreas({ page: 1, limit: 100 }));
    }
  }, [isOpen, dispatch, areas.length]);

  // Debounced search for areas
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAreaSearch(areaSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [areaSearchTerm]);

  // Filter areas based on search term
  const filteredAreas = useMemo(() => {
    if (!debouncedAreaSearch.trim()) {
      return areas;
    }
    
    const searchLower = debouncedAreaSearch.toLowerCase();
    return areas.filter(area => 
      area.name.toLowerCase().includes(searchLower) ||
      area.city.toLowerCase().includes(searchLower) ||
      area.state.toLowerCase().includes(searchLower)
    );
  }, [areas, debouncedAreaSearch]);

  const onSubmit = async (data) => {
    try {
      const userData = {
        ...data,
        role: selectedRole,
        area: selectedArea,
        isActive: true
      };
      
      const result = await dispatch(createUserFetch(userData)).unwrap();
      
      toast.success('User created successfully!');
      onSuccess(result);
      
      // Reset form
      reset();
      setSelectedRole('salesman');
      setSelectedArea('');
      setAreaSearchTerm('');
      setDebouncedAreaSearch('');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to create user');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedRole('salesman');
    setSelectedArea('');
    setAreaSearchTerm('');
    setDebouncedAreaSearch('');
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new team member with appropriate access levels
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Display */}
          {usersError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{typeof usersError === 'string' ? usersError : 'An error occurred'}</p>
            </div>
          )}
          
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                First Name *
              </label>
              <Input
                {...register('firstName', { 
                  required: 'First name is required',
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <Input
                {...register('lastName', { 
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email *
              </label>
              <div className="relative">
                <Input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { 
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  placeholder="john.doe@example.com"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password *
              </label>
              <Input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' }
                })}
                placeholder="Password"
                type="password"
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Area *
              </label>
              <div className="relative">
                <Select
                  value={selectedArea}
                  onValueChange={(value) => {
                    setSelectedArea(value);
                    setValue('area', value, { shouldValidate: true });
                  }}
                  disabled={areasLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an area..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]" position="popper" side="bottom" align="start">
                    {/* Search Input */}
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search areas..."
                          value={areaSearchTerm}
                          onChange={(e) => setAreaSearchTerm(e.target.value)}
                          className="pl-10 pr-10 h-8 text-sm"
                        />
                        {areaSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setAreaSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Area Options */}
                    <div className="max-h-[200px] overflow-y-auto">
                      {areasLoading ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          Loading areas...
                        </div>
                      ) : filteredAreas.length === 0 ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          {debouncedAreaSearch ? 'No areas found matching your search' : 'No areas found'}
                        </div>
                      ) : (
                        filteredAreas.map((area) => (
                          <SelectItem key={area._id} value={area._id} className="py-2">
                            <div className="flex flex-col">
                              <span className="font-medium">{area.name}</span>
                              <span className="text-xs text-gray-500">{area.city}, {area.state}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </div>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register('area', { required: 'Area is required' })}
                />
              </div>
              {errors.area && (
                <p className="text-sm text-red-600">{errors.area.message}</p>
              )}
              {areasError && (
                <p className="text-sm text-red-600">{typeof areasError === 'string' ? areasError : 'An error occurred'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <Input
                  {...register('phone')}
                  placeholder="+91 XXXXXXXXXX"
                  className="pl-10"
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                />

                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={usersLoading}
            >
              {usersLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
