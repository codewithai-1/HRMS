import React, { useState, useEffect } from 'react';
import { LeaveUsageReport, LeaveRequest, LeaveBalance } from '../../types/leave';
import leaveService from '../../services/leaveService';
import './LeaveStatistics.css';

const LeaveStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<LeaveUsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
        const endDate = new Date(new Date().getFullYear(), 11, 31).toISOString();

        // Fetch both leave requests and balances
        const [leaveRequestsResponse, leaveBalancesResponse] = await Promise.all([
          leaveService.leaveRequests.getAll({
            startDate,
            endDate
          }),
          leaveService.leaveBalances.getAll()
        ]);

        const leaveRequests = leaveRequestsResponse.data;
        const leaveBalances = leaveBalancesResponse.data;

        // Group leave requests by employee
        const employeeLeaveMap = new Map<string, {
          employeeId: string;
          employeeName: string;
          leaveTypes: Map<string, {
            leaveTypeId: string;
            leaveTypeName: string;
            totalDays: number;
            usedDays: number;
            remainingDays: number;
          }>;
        }>();

        // Initialize with leave balances
        leaveBalances.forEach((balance: LeaveBalance) => {
          const employeeData = employeeLeaveMap.get(balance.employeeId) || {
            employeeId: balance.employeeId,
            employeeName: 'Employee', // Will be updated from leave requests
            leaveTypes: new Map()
          };

          employeeData.leaveTypes.set(balance.leaveTypeId, {
            leaveTypeId: balance.leaveTypeId,
            leaveTypeName: balance.leaveType.name,
            totalDays: balance.totalDays,
            usedDays: 0, // Will be calculated from leave requests
            remainingDays: balance.remainingDays
          });

          employeeLeaveMap.set(balance.employeeId, employeeData);
        });

        // Calculate used days from leave requests
        leaveRequests.forEach((request: LeaveRequest) => {
          if (request.status === 'APPROVED') {
            const employeeData = employeeLeaveMap.get(request.employeeId);
            if (employeeData) {
              employeeData.employeeName = request.employeeName;
              const leaveTypeData = employeeData.leaveTypes.get(request.leaveTypeId);
              if (leaveTypeData) {
                leaveTypeData.usedDays += request.numberOfDays;
              }
            }
          }
        });

        // Convert to LeaveUsageReport format
        const statistics: LeaveUsageReport = {
          departmentId: 'all',
          departmentName: 'All Departments',
          employees: Array.from(employeeLeaveMap.values()).map(employee => ({
            employeeId: employee.employeeId,
            employeeName: employee.employeeName,
            leaveTypes: Array.from(employee.leaveTypes.values())
          }))
        };

        setStatistics(statistics);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave statistics:', err);
        setError('Failed to load leave statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="statistics-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-container">
        <div className="error-message">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!statistics || !statistics.employees.length) {
    return (
      <div className="statistics-container">
        <div className="empty-message">
          No leave statistics available for the current year.
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>Leave Usage Statistics - {new Date().getFullYear()}</h2>
        <p className="text-subtitle">Department: {statistics.departmentName}</p>
      </div>

      <div className="statistics-grid">
        <div className="statistics-grid-header">
          <div className="col-employee">Employee</div>
          <div className="col-leave-types">Leave Types</div>
          <div className="col-total">Total Days</div>
          <div className="col-used">Used Days</div>
          <div className="col-remaining">Remaining</div>
        </div>

        <div className="statistics-grid-body">
          {statistics.employees.map((employee) => (
            <div key={employee.employeeId} className="statistics-grid-row">
              <div className="col-employee">
                <span className="employee-name">{employee.employeeName}</span>
              </div>
              <div className="col-leave-types">
                <div className="leave-types-list">
                  {employee.leaveTypes.map((type) => (
                    <div key={type.leaveTypeId} className="leave-type-item">
                      <span className="leave-type-name">{type.leaveTypeName}</span>
                      <div className="leave-progress">
                        <div 
                          className="leave-progress-bar"
                          style={{
                            width: `${(type.usedDays / type.totalDays) * 100}%`,
                            backgroundColor: type.remainingDays <= 0 ? '#ef4444' : '#3b82f6'
                          }}
                        />
                      </div>
                      <span className="leave-days">
                        {type.usedDays}/{type.totalDays} days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-total">
                {employee.leaveTypes.reduce((acc, curr) => acc + curr.totalDays, 0)} days
              </div>
              <div className="col-used">
                {employee.leaveTypes.reduce((acc, curr) => acc + curr.usedDays, 0)} days
              </div>
              <div className="col-remaining">
                {employee.leaveTypes.reduce((acc, curr) => acc + curr.remainingDays, 0)} days
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveStatistics; 