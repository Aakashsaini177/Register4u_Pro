import React, { useState, useEffect } from 'react';
import { X, Users, Search, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const AssignEmployeesModal = ({ place, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    fetchEmployees();
    // Initialize with currently assigned employees
    if (place.assignedEmployees) {
      setSelectedEmployees(place.assignedEmployees.map(emp => emp._id || emp));
    }
  }, [place]);

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

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    const filteredEmployeeIds = filteredEmployees.map(emp => emp._id);
    setSelectedEmployees(prev => {
      const allSelected = filteredEmployeeIds.every(id => prev.includes(id));
      if (allSelected) {
        // Deselect all filtered employees
        return prev.filter(id => !filteredEmployeeIds.includes(id));
      } else {
        // Select all filtered employees
        const newSelected = [...prev];
        filteredEmployeeIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const response = await api.post(`/places/${place._id}/assign-employees`, {
        employeeIds: selectedEmployees,
      });
      
      if (response.data.success) {
        toast.success('Employees assigned successfully');
        onSuccess();
      }
    } catch (error) {
      console.error('Error assigning employees:', error);
      toast.error(error.response?.data?.message || 'Failed to assign employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.emp_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allFilteredSelected = filteredEmployees.length > 0 && 
    filteredEmployees.every(emp => selectedEmployees.includes(emp._id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Assign Employees</h2>
              <p className="text-muted-foreground text-sm">Assign employees to {place.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-6 border-b border-border">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees by name, code, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
            >
              {allFilteredSelected ? <UserX size={16} /> : <UserCheck size={16} />}
              {allFilteredSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedEmployees.length} of {employees.length} employees selected
            {searchTerm && ` • Showing ${filteredEmployees.length} results`}
          </div>
        </div>

        {/* Employee List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loadingEmployees ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading employees...</p>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="space-y-2">
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.includes(employee._id);
                const isCurrentlyAssigned = place.assignedEmployees?.some(
                  emp => (emp._id || emp) === employee._id
                );
                
                return (
                  <label
                    key={employee._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-card border-border hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleEmployeeToggle(employee._id)}
                      className="rounded border-border text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-foreground">{employee.fullName}</div>
                        {isCurrentlyAssigned && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                            Currently Assigned
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {employee.emp_code} • {employee.emp_type}
                        {employee.email && ` • ${employee.email}`}
                      </div>
                      {employee.contact && (
                        <div className="text-xs text-muted-foreground">{employee.contact}</div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No employees found' : 'No employees available'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No employees are available for assignment'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Assigning...' : `Assign ${selectedEmployees.length} Employees`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployeesModal;