import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AutomationModal = ({ isOpen, onClose, projectId, onAutomationCreated }) => {
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('status_change');
  const [triggerCondition, setTriggerCondition] = useState('');
  const [actionType, setActionType] = useState('add_badge');
  const [actionParams, setActionParams] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && projectId) {
      api.get(`/projects/${projectId}`)
        .then(response => {
          setStatuses(response.data.statuses || []);
          setMembers(response.data.members || []);
        })
        .catch(err => {
          console.error('Error fetching project:', err);
          setError('Failed to load project statuses');
        });
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const automationData = {
        name,
        project: projectId,
        trigger: {
          type: triggerType,
          condition: triggerCondition
        },
        action: {
          type: actionType,
          params: actionParams
        }
      };

      const response = await api.post('/automations', automationData);
      onAutomationCreated(response.data);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error creating automation:', err);
      setError('Failed to create automation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setTriggerType('status_change');
    setTriggerCondition('');
    setActionType('add_badge');
    setActionParams('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Automation</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Automation Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Trigger Type</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="status_change">Status Change</option>
              <option value="assignee_change">Assignee Change</option>
              <option value="due_date_passed">Due Date Passed</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Trigger Condition</label>
            {triggerType === 'status_change' ? (
              <select
                value={triggerCondition}
                onChange={(e) => setTriggerCondition(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Status</option>
                {statuses.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
              ): triggerType === 'assignee_change' ? (
             <select
               value={triggerCondition}
               onChange={e => setTriggerCondition(e.target.value)}
               className="w-full p-2 border rounded"
               required
             >
               <option value="">Select Assignee</option>
               {members.map(m => (
                 <option key={m._id} value={m._id}>
                   {m.name || m.email}
                 </option>
               ))}
             </select>
            ) : (
             <input
               type="number"               
               value={triggerCondition}
               onChange={e => setTriggerCondition(e.target.value)}
               className="w-full p-2 border rounded"
               placeholder="Days past due (e.g. 1)"
               required
             />
             )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="add_badge">Add Badge</option>
              <option value="change_status">Change Status</option>
              <option value="send_notification">Send Notification</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Action Parameters</label>
            {actionType === 'change_status' ? (
              <select
                value={actionParams}
                onChange={(e) => setActionParams(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Status</option>
                {statuses.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={actionParams}
                onChange={(e) => setActionParams(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder={actionType === 'add_badge' ? 'Badge name (e.g. urgent)' : 'Notification message'}
                required
              />
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Automation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomationModal;