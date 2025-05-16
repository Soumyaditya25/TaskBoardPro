import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ProjectSettingsModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statuses, setStatuses] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      setStatuses((project.statuses || []).join(', '));
      setMembers(project.members || []);
    }
  }, [isOpen, project]);

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const statusArray = statuses.split(',').map(status => status.trim()).filter(Boolean);
      
      if (statusArray.length < 2) {
        setError('Please provide at least 2 statuses');
        setLoading(false);
        return;
      }

      const projectData = {
        title,
        description,
        statuses: statusArray
      };

      const response = await api.put(`/projects/${project._id}`, projectData);
      onProjectUpdated(response.data);
      setSuccessMessage('Project updated successfully');
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

const handleDeleteProject = async () => {
  if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone and will delete all tasks associated with this project.')) {
    return;
  }
  
  setLoading(true);
  setError('');
  
  try {
    await api.delete(`/projects/${project._id}`);
    onClose(); 
    navigate('/'); 
  } catch (err) {
    console.error('Error deleting project:', err);
    setError('Failed to delete project: ' + (err.response?.data?.message || err.message));
    setLoading(false);
  }
};

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post(`/projects/${project._id}/members`, { email: memberEmail });
      setMembers(response.data.members);
      setMemberEmail('');
      setSuccessMessage('Member added successfully');
      onProjectUpdated(response.data);
    } catch (err) {
      console.error('Error adding member:', err);
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.delete(`/projects/${project._id}/members/${memberId}`);
      setMembers(response.data.members);
      setSuccessMessage('Member removed successfully');
      onProjectUpdated(response.data);
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Project Settings</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        {successMessage && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{successMessage}</div>}
        
        <form onSubmit={handleUpdateProject} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Statuses (comma separated)</label>
            <input
              type="text"
              value={statuses}
              onChange={(e) => setStatuses(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Example: To Do, In Progress, Done</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Project'}
          </button>
        </form>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Project Members</h3>
          
          <form onSubmit={handleAddMember} className="mb-4 flex gap-2">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Enter email to invite"
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              disabled={loading || !memberEmail}
              className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
            >
              Add
            </button>
          </form>
          
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <img
                    src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.email)}&background=random`}
                    alt={member.name || member.email}
                    className="h-6 w-6 rounded-full"
                  />
                  <span>{member.name || member.email}</span>
                  {member._id === project.owner && (
                    <span className="text-xs bg-gray-200 px-1 rounded">Owner</span>
                  )}
                </div>
                {member._id !== project.owner && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-600 mb-4">
              Once you delete a project, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteProject}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
          {loading ? 'Deleting...' : 'Delete Project'}
         </button>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;