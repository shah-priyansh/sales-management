import React from 'react';
import { useForm } from 'react-hook-form';
import { X, MapPin, Building2, FileText } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Area</h2>
              <p className="text-sm text-gray-600">Create a new sales territory</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Area Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Area Name *
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('name', { 
                  required: 'Area name is required',
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Downtown District"
              />
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City *
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('city', { 
                  required: 'City is required',
                  minLength: { value: 2, message: 'Min 2 characters' }
                })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., New York"
              />
              <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <textarea
                {...register('description')}
                rows={3}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Describe the area characteristics, target market, etc."
              />
              <FileText className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Status
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  {...register('isActive')}
                  defaultChecked
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-900">Active</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  {...register('isActive')}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-900">Inactive</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Create Area
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAreaModal;
