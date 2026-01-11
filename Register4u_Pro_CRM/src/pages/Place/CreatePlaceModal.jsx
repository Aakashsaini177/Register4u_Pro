import React, { useState, useEffect } from 'react';
import { X, MapPin, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const CreatePlaceModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    assignedEmployees: [],
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await api.post('/getAllEmployee', {});
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeSelection = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(employeeId)
        ? prev.assignedEmployees.filter(id => id !== employeeId)
        : [...prev.assignedEmployees, employeeId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Place name is required');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post('/places', formData);
      
      if (response.data.success) {
        toast.success('Place created successfully');
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating place:', error);
      toast.error(error.response?.data?.message || 'Failed to create place');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Add New Place</h2>
              <p className="text-muted-foreground text-sm">Create a new place and assign employees</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Place Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Enter place name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Enter place description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="e.g., Building A, Floor 2"
              />
            </div>
          </div>

          {/* Employee Assignment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-muted-foreground" />
              <h3 className="font-medium text-foreground">Assign Employees</h3>
            </div>

            {loadingEmployees ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No employees found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-border rounded-lg p-3">
                {employees.map((employee) => (
                  <label key={employee._id} className="flex items-center gap-2 p-2 hover:bg-secondary rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignedEmployees.includes(employee._id)}
                      onChange={() => handleEmployeeSelection(employee._id)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">{employee.fullName}</div>
                      <div className="text-xs text-muted-foreground">{employee.emp_code} • {employee.emp_type}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaceModal;