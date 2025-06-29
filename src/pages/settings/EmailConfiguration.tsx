import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { EnvelopeIcon, DocumentTextIcon, PaperAirplaneIcon, VariableIcon, BoltIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import emailService from '../../services/emailService';
import './EmailConfiguration.css';
import { useNavigate } from 'react-router-dom';

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  fromEmail: string;
  fromName: string;
  useTLS: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  triggers: string[];
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const EmailConfiguration: React.FC = () => {
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls',
    fromEmail: '',
    fromName: '',
    useTLS: true
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableVariables, setAvailableVariables] = useState<TemplateVariable[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<TemplateTrigger[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [smtpData, templatesData, variablesData, triggersData] = await Promise.all([
        emailService.getSMTPConfig(),
        emailService.getTemplates(),
        emailService.getTemplateVariables(),
        emailService.getTemplateTriggers()
      ]);
      setSmtpConfig(smtpData);
      setTemplates(templatesData);
      setAvailableVariables(variablesData);
      setAvailableTriggers(triggersData);
    } catch (err) {
      setError('Failed to load email configuration data');
      console.error('Error loading email configuration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      await emailService.updateSMTPConfig(smtpConfig);
      setSuccess('SMTP configuration updated successfully');
    } catch (err) {
      setError('Failed to update SMTP configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const result = await emailService.testSMTPConnection(smtpConfig);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Failed to test SMTP connection'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSmtpConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      setError(null);
      if (selectedTemplate.id) {
        await emailService.updateTemplate(selectedTemplate.id, selectedTemplate);
      } else {
        const newTemplate = await emailService.createTemplate(selectedTemplate);
        setSelectedTemplate(newTemplate);
      }
      // Refresh templates list
      const updatedTemplates = await emailService.getTemplates();
      setTemplates(updatedTemplates);
      // Show success message or notification
    } catch (err) {
      setError('Failed to save template');
      console.error('Error saving template:', err);
    }
  };

  const handleTestTemplate = async () => {
    if (!selectedTemplate || !testEmail) return;
    try {
      setError(null);
      const result = await emailService.testTemplate(selectedTemplate.id, testEmail);
      setTestResult(result);
    } catch (err) {
      setError('Failed to test template');
      console.error('Error testing template:', err);
    }
  };

  const handleCreateNewTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: '',
      name: 'New Template',
      subject: '',
      body: '',
      variables: [],
      triggers: [],
      type: 'CUSTOM',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedTemplate(newTemplate);
  };

  const handleVariableClick = (variable: TemplateVariable) => {
    if (!selectedTemplate) return;
    
    const currentVariables = selectedTemplate.variables || [];
    const variableName = `{{${variable.name}}}`;
    const newVariables = currentVariables.includes(variableName)
      ? currentVariables.filter(v => v !== variableName)
      : [...currentVariables, variableName];
    
    setSelectedTemplate({
      ...selectedTemplate,
      variables: newVariables
    });
  };

  const handleTriggerClick = (trigger: TemplateTrigger) => {
    if (!selectedTemplate) return;
    
    const currentTriggers = selectedTemplate.triggers || [];
    const newTriggers = currentTriggers.includes(trigger.event)
      ? currentTriggers.filter(t => t !== trigger.event)
      : [...currentTriggers, trigger.event];
    
    setSelectedTemplate({
      ...selectedTemplate,
      triggers: newTriggers
    });
  };

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
            <h1 className="email-title">Email Configuration</h1>
            <p className="email-subtitle">
              Configure email settings and manage templates
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/settings/email/templates')}
              className="create-button"
            >
              <DocumentTextIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Manage Templates
            </button>
            <button
              type="button"
              onClick={() => navigate('/settings/email/variables-triggers')}
              className="create-button"
            >
              <VariableIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Manage Variables & Triggers
            </button>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="error-message">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}

      {/* SMTP Configuration Form */}
      <div className="email-content">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">SMTP Configuration</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Configure your SMTP server settings for sending emails.</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="host" className="block text-sm font-medium leading-6 text-gray-900">
                    SMTP Host
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="host"
                      id="host"
                      value={smtpConfig.host}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="smtp.example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="port" className="block text-sm font-medium leading-6 text-gray-900">
                    Port
                  </label>
                  <div className="mt-2">
                    <input
                      type="number"
                      name="port"
                      id="port"
                      value={smtpConfig.port}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="587"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                    Username
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={smtpConfig.username}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={smtpConfig.password}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fromEmail" className="block text-sm font-medium leading-6 text-gray-900">
                    From Email
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      name="fromEmail"
                      id="fromEmail"
                      value={smtpConfig.fromEmail}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="noreply@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fromName" className="block text-sm font-medium leading-6 text-gray-900">
                    From Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="fromName"
                      id="fromName"
                      value={smtpConfig.fromName}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Company Name"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                      <input
                        type="checkbox"
                        name="useTLS"
                        id="useTLS"
                        checked={smtpConfig.useTLS}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="useTLS" className="font-medium text-gray-900">
                        Use TLS
                      </label>
                      <p className="text-gray-500">Enable TLS encryption for secure email transmission</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isLoading || isTesting}
                  className="filter-button"
                >
                  {isTesting ? (
                    <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 animate-spin text-gray-400" aria-hidden="true" />
                  ) : (
                    <EnvelopeIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                  Test Connection
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="create-button"
                >
                  {isLoading ? (
                    <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  )}
                  Save Configuration
                </button>
              </div>
            </form>

            {/* Test Result */}
            {testResult && (
              <div className={`mt-4 rounded-md p-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {testResult.success ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfiguration; 