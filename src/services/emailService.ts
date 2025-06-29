import axios from 'axios';
import config from '../config';

// Default template variables
const defaultVariables = [
  '{{employeeName}}',
  '{{employeeEmail}}',
  '{{departmentName}}',
  '{{managerName}}',
  '{{companyName}}',
  '{{position}}',
  '{{startDate}}',
  '{{endDate}}',
  '{{leaveType}}',
  '{{leaveDuration}}',
  '{{approvalStatus}}',
  '{{rejectionReason}}',
  '{{currentDate}}',
  '{{systemUrl}}',
  '{{resetPasswordLink}}',
  '{{verificationLink}}'
];

// Default template triggers
const defaultTriggers = [
  'employee.onboarding',
  'employee.offboarding',
  'leave.request.submitted',
  'leave.request.approved',
  'leave.request.rejected',
  'password.reset.requested',
  'email.verification',
  'attendance.reminder',
  'performance.review.assigned',
  'performance.review.completed',
  'goal.assigned',
  'goal.completed',
  'goal.overdue',
  'recognition.awarded',
  'anniversary.reminder',
  'birthday.reminder'
];

const emailService = {
  // SMTP Configuration
  getSMTPConfig: async () => {
    const response = await axios.get(`${config.api.baseUrl}/email-smtp`);
    return response.data;
  },

  updateSMTPConfig: async (config: any) => {
    const response = await axios.put(`${config.api.baseUrl}/email-smtp`, config);
    return response.data;
  },

  testSMTPConnection: async (config: any) => {
    const response = await axios.post(`${config.api.baseUrl}/email-smtp/test`, config);
    return response.data;
  },

  // Email Templates
  getTemplates: async () => {
    const response = await axios.get(`${config.api.baseUrl}/email-templates`);
    return response.data;
  },

  getTemplate: async (id: string) => {
    const response = await axios.get(`${config.api.baseUrl}/email-templates/${id}`);
    return response.data;
  },

  createTemplate: async (template: any) => {
    const response = await axios.post(`${config.api.baseUrl}/email-templates`, template);
    return response.data;
  },

  updateTemplate: async (id: string, template: any) => {
    const response = await axios.put(`${config.api.baseUrl}/email-templates/${id}`, template);
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await axios.delete(`${config.api.baseUrl}/email-templates/${id}`);
    return response.data;
  },

  testTemplate: async (id: string, testEmail: string) => {
    const response = await axios.post(`${config.api.baseUrl}/email-templates/${id}/test`, {
      testEmail
    });
    return response.data;
  },

  // Template Variables
  getTemplateVariables: async () => {
    try {
      const response = await axios.get(`${config.api.baseUrl}/email-template-variables`);
      return response.data;
    } catch (error) {
      // Return default variables if API call fails
      return defaultVariables;
    }
  },

  createTemplateVariable: async (variable: any) => {
    const response = await axios.post(`${config.api.baseUrl}/email-template-variables`, variable);
    return response.data;
  },

  updateTemplateVariable: async (id: string, variable: any) => {
    const response = await axios.put(`${config.api.baseUrl}/email-template-variables/${id}`, variable);
    return response.data;
  },

  deleteTemplateVariable: async (id: string) => {
    const response = await axios.delete(`${config.api.baseUrl}/email-template-variables/${id}`);
    return response.data;
  },

  // Template Triggers
  getTemplateTriggers: async () => {
    try {
      const response = await axios.get(`${config.api.baseUrl}/email-template-triggers`);
      return response.data;
    } catch (error) {
      // Return default triggers if API call fails
      return defaultTriggers;
    }
  },

  createTemplateTrigger: async (trigger: any) => {
    const response = await axios.post(`${config.api.baseUrl}/email-template-triggers`, trigger);
    return response.data;
  },

  updateTemplateTrigger: async (id: string, trigger: any) => {
    const response = await axios.put(`${config.api.baseUrl}/email-template-triggers/${id}`, trigger);
    return response.data;
  },

  deleteTemplateTrigger: async (id: string) => {
    const response = await axios.delete(`${config.api.baseUrl}/email-template-triggers/${id}`);
    return response.data;
  }
};

export default emailService; 