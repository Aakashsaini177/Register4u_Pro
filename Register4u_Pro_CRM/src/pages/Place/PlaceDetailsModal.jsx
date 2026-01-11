import React, { useState, useEffect } from 'react';
import { X, MapPin, Building, Users, Settings, Clock, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const PlaceDetailsModal = ({ place, onClose }) => {
  const [visitorHistory, setVisitorHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (activeTab === 'history') {
      fetchVisitorHistory();
    }
  }, [activeTab, place]);

  const fetchVisitorHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/places/${place._id}/history?limit=20`);
      if (response.data.success) {
        setVisitorHistory(response.data.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching visitor history:', error);
      toast.error('Failed to fetch visitor history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <MapPin className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{place.name}</h2>
              <p className="text-muted-foreground text-sm">{place.placeCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building size={16} className="inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock size={16} className="inline mr-2" />
              Visitor History
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Building size={18} />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground">{place.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Place Code</label>
                      <p className="text-foreground font-mono">{place.placeCode}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        place.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {place.status}
                      </span>
                    </div>
                    
                    {place.capacity > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                        <p className="text-foreground">{place.capacity} visitors</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <MapPin size={18} />
                    Location Details
                  </h3>
                  
                  <div className="space-y-3">
                    {place.location && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="text-foreground">{place.location}</p>
                      </div>
                    )}
                    
                    {place.address && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-foreground">{place.address}</p>
                      </div>
                    )}
                    
                    {place.description && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-foreground">{place.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned Employees */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Users size={18} />
                  Assigned Employees ({place.assignedEmployees?.length || 0})
                </h3>
                
                {place.assignedEmployees && place.assignedEmployees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {place.assignedEmployees.map((employee) => (
                      <div key={employee._id} className="bg-muted/50 rounded-lg p-3">
                        <div className="font-medium text-foreground">{employee.fullName}</div>
                        <div className="text-sm text-muted-foreground">{employee.emp_code}</div>
                        <div className="text-xs text-muted-foreground capitalize">{employee.emp_type}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No employees assigned</p>
                )}

                {place.manager && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-foreground">Place Manager</label>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-1">
                      <div className="font-medium text-blue-900 dark:text-blue-200">{place.manager.fullName}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300">{place.manager.emp_code}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Settings size={18} />
                  Place Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        place.settings?.allowVisitorRegistration ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-foreground">Visitor Registration</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        place.settings?.requireApproval ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm text-foreground">
                        {place.settings?.requireApproval ? 'Requires Approval' : 'Auto Approval'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    {place.settings?.maxVisitorsPerDay > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Daily Visitor Limit</label>
                        <p className="text-foreground">{place.settings.maxVisitorsPerDay} visitors</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-foreground">{formatDate(place.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-foreground">{formatDate(place.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Clock size={18} />
                  Recent Visitor Activity
                </h3>
                <button
                  onClick={fetchVisitorHistory}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Refresh
                </button>
              </div>

              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading history...</p>
                </div>
              ) : visitorHistory.length > 0 ? (
                <div className="space-y-3">
                  {visitorHistory.map((activity) => (
                    <div key={activity.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye size={16} className="text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {activity.visitor?.name || 'Unknown Visitor'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.type === 'scan' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            }`}>
                              {activity.type}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{activity.action}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>By: {activity.employee.name}</span>
                            <span>•</span>
                            <span>{formatDate(activity.timestamp)}</span>
                            {activity.visitor?.companyName && (
                              <>
                                <span>•</span>
                                <span>{activity.visitor.companyName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {activity.visitor?.photo && (
                          <img
                            src={activity.visitor.photo}
                            alt={activity.visitor.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">Visitor activities at this place will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailsModal;