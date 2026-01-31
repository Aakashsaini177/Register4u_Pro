import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const CreatePlaceModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Add New Place</h2>
              <p className="text-muted-foreground text-sm">Create a new place</p>
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
          {/* Place Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Place Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-base"
              placeholder="Enter place name"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              You can assign employees to this place later from Employee management
            </p>
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