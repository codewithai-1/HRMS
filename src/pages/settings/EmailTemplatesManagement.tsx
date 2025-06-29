import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import emailService from '../../services/emailService';
import './EmailConfiguration.css';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'system' | 'custom';
  variables: string[];
  triggers: string[];
  isActive: boolean;
}

interface TemplateVariable {
  name: string;
  description: string;
}

interface TemplateTrigger {
  name: string;
  description: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: Omit<EmailTemplate, 'id'>) => Promise<void>;
  template?: EmailTemplate;
  availableVariables: string[];
  availableTriggers: string[];
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
  availableVariables,
  availableTriggers
}) => {
  const [formData, setFormData] = useState<Omit<EmailTemplate, 'id'>>({
    name: '',
    subject: '',
    body: '',
    type: 'custom',
    variables: [],
    triggers: [],
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        type: template.type,
        variables: template.variables,
        triggers: template.triggers,
        isActive: template.isActive
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-gray-900">
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Template Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                  Body
                </label>
                <textarea
                  name="body"
                  id="body"
                  rows={6}
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'system' | 'custom' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="system">System</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Variables</label>
                <div className="mt-2 space-y-2">
                  {availableVariables.map((variable) => (
                    <div key={variable} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`variable-${variable}`}
                        checked={formData.variables.includes(variable)}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            variables: e.target.checked
                              ? [...prev.variables, variable]
                              : prev.variables.filter(v => v !== variable)
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`variable-${variable}`} className="ml-2 block text-sm text-gray-900">
                        {variable}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Triggers</label>
                <div className="mt-2 space-y-2">
                  {availableTriggers.map((trigger) => (
                    <div key={trigger} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`trigger-${trigger}`}
                        checked={formData.triggers.includes(trigger)}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            triggers: e.target.checked
                              ? [...prev.triggers, trigger]
                              : prev.triggers.filter(t => t !== trigger)
                          }));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`trigger-${trigger}`} className="ml-2 block text-sm text-gray-900">
                        {trigger}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="isActive" className="font-medium text-gray-900">
                    Active
                  </label>
                  <p className="text-gray-500">Enable or disable this template</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="save-button"
            >
              {isLoading ? (
                <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              )}
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmailTemplatesManagement: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof EmailTemplate>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [templatesData, variablesData, triggersData] = await Promise.all([
        emailService.getTemplates(),
        emailService.getTemplateVariables(),
        emailService.getTemplateTriggers()
      ]);
      setTemplates(templatesData);
      setAvailableVariables(variablesData.map((v: TemplateVariable) => v.name));
      setAvailableTriggers(triggersData.map((t: TemplateTrigger) => t.name));
    } catch (err) {
      setError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (template: Omit<EmailTemplate, 'id'>) => {
    try {
      const newTemplate = await emailService.createTemplate(template);
      setTemplates(prev => [...prev, newTemplate]);
    } catch (err) {
      throw new Error('Failed to create template');
    }
  };

  const handleUpdateTemplate = async (template: Omit<EmailTemplate, 'id'>) => {
    if (!selectedTemplate) return;
    try {
      const updatedTemplate = await emailService.updateTemplate(selectedTemplate.id, template);
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
    } catch (err) {
      throw new Error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await emailService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  const handleSort = (field: keyof EmailTemplate) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const filteredTemplates = templates
    .filter(template => 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aValue < bValue ? -direction : aValue > bValue ? direction : 0;
    });

  if (isLoading) {
    return (
      <div className="email-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="email-container">
      {/* Header Section */}
      <div className="email-header">
        <div className="header-top-row">
          <div>
            <h1 className="email-title">Email Templates</h1>
            <p className="email-subtitle">
              Manage your email templates and their configurations
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedTemplate(undefined);
                setIsModalOpen(true);
              }}
              className="create-button"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              New Template
            </button>
          </div>
        </div>
        <div className="header-bottom-row">
          <div className="email-controls">
            <div className="search-container">
              <div className="search-icon-wrapper">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Templates List */}
      <div className="email-content">
        <div className="email-grid">
          <div className="email-grid-header">
            <div 
              className="col-name cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('name')}
            >
              <span>Template Name</span>
              {getSortIcon('name')}
            </div>
            <div 
              className="col-subject cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('subject')}
            >
              <span>Subject</span>
              {getSortIcon('subject')}
            </div>
            <div 
              className="col-type cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('type')}
            >
              <span>Type</span>
              {getSortIcon('type')}
            </div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="email-grid-body">
            {filteredTemplates.length === 0 ? (
              <div className="empty-message">
                No templates found. Create your first template to get started.
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div key={template.id} className="email-grid-row">
                  <div className="col-name">
                    <span className="font-medium text-gray-900">{template.name}</span>
                  </div>
                  <div className="col-subject">
                    <span>{template.subject}</span>
                  </div>
                  <div className="col-type">
                    <span className="capitalize">{template.type}</span>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${template.isActive ? 'active' : 'inactive'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-button edit"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsModalOpen(true);
                      }}
                      title="Edit template"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteTemplate(template.id)}
                      title="Delete template"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Template Modal */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTemplate(undefined);
        }}
        onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
        template={selectedTemplate}
        availableVariables={availableVariables}
        availableTriggers={availableTriggers}
      />
    </div>
  );
};

export default EmailTemplatesManagement; 