import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Users, Settings, Trash2, Edit, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import CreatePlaceModal from './CreatePlaceModal';
import EditPlaceModal from './EditPlaceModal';
import PlaceDetailsModal from './PlaceDetailsModal';
import AssignEmployeesModal from './AssignEmployeesModal';

const PlaceManagement = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await api.get('/places');
      if (response.data.success) {
        setPlaces(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      toast.error('Failed to fetch places');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (!window.confirm('Are you sure you want to delete this place?')) {
      return;
    }

    try {
      const response = await api.delete(`/places/${placeId}`);
      if (response.data.success) {
        toast.success('Place deleted successfully');
        fetchPlaces();
      }
    } catch (error) {
      console.error('Error deleting place:', error);
      toast.error('Failed to delete place');
    }
  };

  const handleEditPlace = (place) => {
    setSelectedPlace(place);
    setShowEditModal(true);
  };

  const handleViewDetails = (place) => {
    setSelectedPlace(place);
    setShowDetailsModal(true);
  };

  const handleAssignEmployees = (place) => {
    setSelectedPlace(place);
    setShowAssignModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-6 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Place Management</h1>
              <p className="text-muted-foreground mt-1">Manage places and assign employees</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Place
            </button>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <div key={place._id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              {/* Place Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{place.name}</h3>
                    <p className="text-blue-100 text-sm">{place.placeCode}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    place.status === 'active' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {place.status}
                  </span>
                </div>
              </div>

              {/* Place Content */}
              <div className="p-4">
                <div className="space-y-3">
                  {place.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={16} />
                      <span className="text-sm">{place.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={16} />
                    <span className="text-sm">{place.employeeCount || 0} employees assigned</span>
                  </div>

                  {place.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">{place.description}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => handleViewDetails(place)}
                    className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleAssignEmployees(place)}
                    className="flex-1 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
                  >
                    <Users size={16} />
                    Assign
                  </button>
                  
                  <button
                    onClick={() => handleEditPlace(place)}
                    className="flex-1 bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeletePlace(place._id)}
                    className="flex-1 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {places.length === 0 && (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No places found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first place</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Place
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreatePlaceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPlaces();
          }}
        />
      )}

      {showEditModal && selectedPlace && (
        <EditPlaceModal
          place={selectedPlace}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPlace(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedPlace(null);
            fetchPlaces();
          }}
        />
      )}

      {showDetailsModal && selectedPlace && (
        <PlaceDetailsModal
          place={selectedPlace}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPlace(null);
          }}
        />
      )}

      {showAssignModal && selectedPlace && (
        <AssignEmployeesModal
          place={selectedPlace}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedPlace(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedPlace(null);
            fetchPlaces();
          }}
        />
      )}
    </div>
  );
};

export default PlaceManagement;