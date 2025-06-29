import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { VariableIcon, BoltIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import emailService from '../../services/emailService';
import './EmailConfiguration.css';

interface TemplateVariable {
  id: string;
  templateId: string;
  name: string;
  description: string;
  type: string;
  required: boolean;
}

interface TemplateTrigger {
  id: string;
  templateId: string;
  event: string;
  description: string;
  recipients: string[];
  cc: string[];
  isActive: boolean;
}

interface VariableFormData {
  name: string;
  description: string;
  type: string;
  required: boolean;
}

interface TriggerFormData {
  event: string;
  description: string;
  recipients: string[];
  cc: string[];
  isActive: boolean;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const EmailVariablesAndTriggers: React.FC = () => {
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [triggers, setTriggers] = useState<TemplateTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<TemplateVariable | null>(null);
  const [editingTrigger, setEditingTrigger] = useState<TemplateTrigger | null>(null);
  const [variableFormData, setVariableFormData] = useState<VariableFormData>({
    name: '',
    description: '',
    type: 'string',
    required: false
  });
  const [triggerFormData, setTriggerFormData] = useState<TriggerFormData>({
    event: '',
    description: '',
    recipients: [],
    cc: [],
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [variablesData, triggersData] = await Promise.all([
        emailService.getTemplateVariables(),
        emailService.getTemplateTriggers()
      ]);
      setVariables(variablesData);
      setTriggers(triggersData);
    } catch (err) {
      setError('Failed to load variables and triggers');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingVariable) {
        await emailService.updateTemplateVariable(editingVariable.id, {
          ...editingVariable,
          ...variableFormData
        });
      } else {
        await emailService.createTemplateVariable(variableFormData);
      }
      setIsVariableModalOpen(false);
      setEditingVariable(null);
      setVariableFormData({
        name: '',
        description: '',
        type: 'string',
        required: false
      });
      fetchData();
    } catch (err) {
      setError('Failed to save variable');
      console.error('Error saving variable:', err);
    }
  };

  const handleTriggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingTrigger) {
        await emailService.updateTemplateTrigger(editingTrigger.id, {
          ...editingTrigger,
          ...triggerFormData
        });
      } else {
        await emailService.createTemplateTrigger(triggerFormData);
      }
      setIsTriggerModalOpen(false);
      setEditingTrigger(null);
      setTriggerFormData({
        event: '',
        description: '',
        recipients: [],
        cc: [],
        isActive: true
      });
      fetchData();
    } catch (err) {
      setError('Failed to save trigger');
      console.error('Error saving trigger:', err);
    }
  };

  const handleDeleteVariable = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this variable?')) {
      try {
        setError(null);
        await emailService.deleteTemplateVariable(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete variable');
        console.error('Error deleting variable:', err);
      }
    }
  };

  const handleDeleteTrigger = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trigger?')) {
      try {
        setError(null);
        await emailService.deleteTemplateTrigger(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete trigger');
        console.error('Error deleting trigger:', err);
      }
    }
  };

  const handleEditVariable = (variable: TemplateVariable) => {
    setEditingVariable(variable);
    setVariableFormData({
      name: variable.name,
      description: variable.description,
      type: variable.type,
      required: variable.required
    });
    setIsVariableModalOpen(true);
  };

  const handleEditTrigger = (trigger: TemplateTrigger) => {
    setEditingTrigger(trigger);
    setTriggerFormData({
      event: trigger.event,
      description: trigger.description,
      recipients: trigger.recipients,
      cc: trigger.cc,
      isActive: trigger.isActive
    });
    setIsTriggerModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="email-config-container">
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            <div className="flex items-center justify-center">
              <VariableIcon className="h-5 w-5 mr-2" />
              Variables
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            <div className="flex items-center justify-center">
              <BoltIcon className="h-5 w-5 mr-2" />
              Triggers
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Email Variables</h2>
              <button
                onClick={() => {
                  setEditingVariable(null);
                  setVariableFormData({
                    name: '',
                    description: '',
                    type: 'string',
                    required: false
                  });
                  setIsVariableModalOpen(true);
                }}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Variable
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {variables.map((variable) => (
                <div key={variable.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{variable.name}</h3>
                      <p className="text-sm text-gray-600">{variable.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          {variable.type}
                        </span>
                        {variable.required && (
                          <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditVariable(variable)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVariable(variable.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Email Triggers</h2>
              <button
                onClick={() => {
                  setEditingTrigger(null);
                  setTriggerFormData({
                    event: '',
                    description: '',
                    recipients: [],
                    cc: [],
                    isActive: true
                  });
                  setIsTriggerModalOpen(true);
                }}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Trigger
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {triggers.map((trigger) => (
                <div key={trigger.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{trigger.event}</h3>
                      <p className="text-sm text-gray-600">{trigger.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                          {trigger.recipients.length} Recipients
                        </span>
                        {trigger.cc.length > 0 && (
                          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                            {trigger.cc.length} CC
                          </span>
                        )}
                        {trigger.isActive ? (
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTrigger(trigger)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(trigger.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Variable Modal */}
      {isVariableModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingVariable ? 'Edit Variable' : 'Add Variable'}
            </h3>
            <form onSubmit={handleVariableSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={variableFormData.name}
                    onChange={(e) =>
                      setVariableFormData({ ...variableFormData, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={variableFormData.description}
                    onChange={(e) =>
                      setVariableFormData({ ...variableFormData, description: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={variableFormData.type}
                    onChange={(e) =>
                      setVariableFormData({ ...variableFormData, type: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={variableFormData.required}
                    onChange={(e) =>
                      setVariableFormData({ ...variableFormData, required: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Required</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsVariableModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingVariable ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Modal */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingTrigger ? 'Edit Trigger' : 'Add Trigger'}
            </h3>
            <form onSubmit={handleTriggerSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event</label>
                  <input
                    type="text"
                    value={triggerFormData.event}
                    onChange={(e) =>
                      setTriggerFormData({ ...triggerFormData, event: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={triggerFormData.description}
                    onChange={(e) =>
                      setTriggerFormData({ ...triggerFormData, description: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipients</label>
                  <input
                    type="text"
                    value={triggerFormData.recipients.join(', ')}
                    onChange={(e) =>
                      setTriggerFormData({
                        ...triggerFormData,
                        recipients: e.target.value.split(',').map((email) => email.trim())
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CC</label>
                  <input
                    type="text"
                    value={triggerFormData.cc.join(', ')}
                    onChange={(e) =>
                      setTriggerFormData({
                        ...triggerFormData,
                        cc: e.target.value.split(',').map((email) => email.trim())
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={triggerFormData.isActive}
                    onChange={(e) =>
                      setTriggerFormData({ ...triggerFormData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsTriggerModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTrigger ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default EmailVariablesAndTriggers; 