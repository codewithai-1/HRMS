import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { EnvelopeIcon, DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import emailService from '../../services/emailService';
import './EmailConfiguration.css';

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  fromEmail: string;
  fromName: string;
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
    fromName: ''
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

  const handleSMTPConfigChange = (field: keyof SMTPConfig, value: string | number) => {
    setSmtpConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSMTPConfig = async () => {
    try {
      setError(null);
      await emailService.updateSMTPConfig(smtpConfig);
      // Show success message or notification
    } catch (err) {
      setError('Failed to save SMTP configuration');
      console.error('Error saving SMTP config:', err);
    }
  };

  const handleTestSMTP = async () => {
    try {
      setIsTesting(true);
      setError(null);
      const result = await emailService.testSMTPConnection(smtpConfig);
      setTestResult(result);
    } catch (err) {
      setError('Failed to test SMTP connection');
      console.error('Error testing SMTP:', err);
    } finally {
      setIsTesting(false);
    }
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
      <div className="email-config-container">
        <div className="loading">Loading email configuration...</div>
      </div>
    );
  }

  return (
    <div className="email-config-container">
      <div className="page-header">
        <h1>Email Configuration</h1>
        <p className="text-gray-600">Configure SMTP settings and manage email templates</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {testResult && (
        <div className={`error-message ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {testResult.message}
          </p>
        </div>
      )}

      <Tab.Group>
        <Tab.List className="tab-list">
          <Tab className={({ selected }) => `tab ${selected ? 'selected' : ''}`}>
            <EnvelopeIcon className="tab-icon" />
            SMTP Settings
          </Tab>
          <Tab className={({ selected }) => `tab ${selected ? 'selected' : ''}`}>
            <DocumentTextIcon className="tab-icon" />
            Email Templates
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* SMTP Settings Panel */}
          <Tab.Panel>
            <div className="config-section">
              <h2>SMTP Configuration</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>SMTP Host</label>
                  <input
                    type="text"
                    value={smtpConfig.host}
                    onChange={(e) => handleSMTPConfigChange('host', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Port</label>
                  <input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => handleSMTPConfigChange('port', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={smtpConfig.username}
                    onChange={(e) => handleSMTPConfigChange('username', e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={smtpConfig.password}
                    onChange={(e) => handleSMTPConfigChange('password', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label>Encryption</label>
                  <select
                    value={smtpConfig.encryption}
                    onChange={(e) => handleSMTPConfigChange('encryption', e.target.value as SMTPConfig['encryption'])}
                  >
                    <option value="none">None</option>
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>From Email</label>
                  <input
                    type="email"
                    value={smtpConfig.fromEmail}
                    onChange={(e) => handleSMTPConfigChange('fromEmail', e.target.value)}
                    placeholder="noreply@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>From Name</label>
                  <input
                    type="text"
                    value={smtpConfig.fromName}
                    onChange={(e) => handleSMTPConfigChange('fromName', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              <div className="button-group">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveSMTPConfig}
                >
                  Save Configuration
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleTestSMTP}
                  disabled={isTesting}
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
          </Tab.Panel>

          {/* Email Templates Panel */}
          <Tab.Panel>
            <div className="config-section">
              <div className="template-header">
                <h2>Email Templates</h2>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateNewTemplate}
                >
                  <DocumentTextIcon className="btn-icon" />
                  New Template
                </button>
              </div>
              
              <div className="template-grid">
                <div className="template-list">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <h3>{template.name}</h3>
                      <p>{template.subject}</p>
                    </div>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="template-editor">
                    <div className="form-group">
                      <label>Template Name</label>
                      <input
                        type="text"
                        value={selectedTemplate.name}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <input
                        type="text"
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Body</label>
                      <textarea
                        value={selectedTemplate.body}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                        rows={10}
                      />
                    </div>
                    <div className="form-group">
                      <label>Variables</label>
                      <div className="variable-list">
                        {availableVariables.map((variable) => (
                          <span 
                            key={variable.id} 
                            className={`variable-tag ${selectedTemplate?.variables?.includes(`{{${variable.name}}}`) ? 'selected' : ''}`}
                            onClick={() => handleVariableClick(variable)}
                            title={variable.description}
                          >
                            {`{{${variable.name}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Triggers</label>
                      <div className="trigger-list">
                        {availableTriggers.map((trigger) => (
                          <span 
                            key={trigger.id} 
                            className={`trigger-tag ${selectedTemplate?.triggers?.includes(trigger.event) ? 'selected' : ''}`}
                            onClick={() => handleTriggerClick(trigger)}
                            title={trigger.description}
                          >
                            {trigger.event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="button-group">
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveTemplate}
                      >
                        Save Template
                      </button>
                      <div className="test-email-group">
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Test email address"
                        />
                        <button
                          className="btn btn-secondary"
                          onClick={handleTestTemplate}
                          disabled={!testEmail}
                        >
                          <PaperAirplaneIcon className="btn-icon" />
                          Test Template
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default EmailConfiguration; 