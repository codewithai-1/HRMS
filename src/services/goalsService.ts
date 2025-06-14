import axios from 'axios';
import { Goal, GoalsGroup, GoalStatus } from '../types/goals';
import config from '../config';

// Use consistent API URL
const API_URL = config.api.useMockData ? 'http://localhost:8090' : config.api.baseUrl;

const goalsService = {
  // Get all goals for current user
  getAllGoals: async () => {
    return axios.get(`${API_URL}/goals-groups`);
  },
  
  // Get goal by id
  getGoalById: async (id: string) => {
    return axios.get(`${API_URL}/goals-groups/${id}`);
  },
  
  // Create a new goal
  createGoal: async (goalData: any) => {
    return axios.post(`${API_URL}/goals-groups`, goalData);
  },
  
  // Update a goal
  updateGoal: async (id: string, goalData: any) => {
    return axios.put(`${API_URL}/goals-groups/${id}`, goalData);
  },
  
  // Delete a goal
  deleteGoal: async (id: string) => {
    return axios.delete(`${API_URL}/goals-groups/${id}`);
  },
  
  // Update goal status
  updateGoalStatus: async (id: string, status: GoalStatus) => {
    return axios.patch(`${API_URL}/goals-groups/${id}/status`, { status });
  },
  
  // Submit goals for approval
  submitGoals: async (goalsGroupId: string) => {
    return axios.post(`${API_URL}/goals-groups/${goalsGroupId}/submit`);
  },
  
  // Approve goals
  approveGoals: async (goalsGroupId: string) => {
    return axios.post(`${API_URL}/goals-groups/${goalsGroupId}/approve`);
  },
  
  // Reject goals
  rejectGoals: async (goalsGroupId: string, comments: string) => {
    return axios.post(`${API_URL}/goals-groups/${goalsGroupId}/reject`, { comments });
  },
  
  // Complete review
  completeReview: async (goalsGroupId: string) => {
    return axios.post(`${API_URL}/goals-groups/${goalsGroupId}/complete`);
  }
};

export default goalsService; 