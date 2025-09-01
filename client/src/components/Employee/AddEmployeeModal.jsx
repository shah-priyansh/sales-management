import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Button, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Card, CardContent } from '../ui';

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState('salesman');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = (data) => {
    const userData = {
      ...data,
      role: selectedRole,
      isActive: true
    };
    onSuccess(userData);
    reset();
    setSelectedRole('salesman');
  };

  const handleClose = () => {
    reset();
    setSelectedRole('salesman');
    onClose();
  };

  const roles = [
    { id: 'admin', name: 'Admin', description: 'Full system access', icon: Shield, color: 'from-red-500 to-pink-600' },
    { id: 'salesman', name: 'Salesman', description: 'Sales and client management', icon: User, color: 'from-blue-500 to-purple-600' },
    { id: 'manager', name: 'Manager', description: 'Team and area oversight', icon: User, color: 'from-green-500 to-teal-600' }
  ];

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
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Select Role *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedRole === role.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${role.color} mb-3`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{role.name}</h4>
                      <p className="text-xs text-gray-600">{role.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

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
                Phone Number
              </label>
              <div className="relative">
                <Input
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="relative">
              <Textarea
                {...register('address')}
                placeholder="Enter full address"
                rows={2}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
