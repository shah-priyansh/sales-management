import React from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Building2, FileText } from 'lucide-react';
import { Button, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui';

const AddAreaModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = (data) => {
    onSuccess(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Add New Area</DialogTitle>
              <DialogDescription>
                Create a new sales territory for your business
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Area Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Area Name *
            </label>
            <div className="relative">
              <Input
                {...register('name', { 
                  required: 'Area name is required',
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                placeholder="e.g., Downtown District"
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              City *
            </label>
            <div className="relative">
              <Input
                {...register('city', { 
                  required: 'City is required',
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                placeholder="e.g., New York"
                className="pl-10"
              />
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="relative">
              <Textarea
                {...register('description')}
                placeholder="Describe the area characteristics, target market, etc."
                rows={3}
                className="pl-10"
              />
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  {...register('isActive')}
                  defaultChecked
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">Active</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  {...register('isActive')}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-900">Inactive</span>
              </label>
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
            >
              Create Area
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAreaModal;
