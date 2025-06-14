import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HolidayList, HolidayStatus, HolidayFormData } from '../../types/holiday';
import { format } from 'date-fns';

interface HolidayListModalProps {
  holidayList: HolidayList | null;
  onClose: () => void;
  onSave: (holidayListData: any) => void;
}

interface HolidayEntry {
  id: string;
  name: string;
  date: string;
  description: string;
  isRecurring: boolean;
}

const HolidayListModal: React.FC<HolidayListModalProps> = ({
  holidayList,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]);
  const [holidayCount, setHolidayCount] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [holidayErrors, setHolidayErrors] = useState<{ [key: string]: { [field: string]: string } }>({});

  useEffect(() => {
    if (holidayList) {
      setName(holidayList.name);
      setYear(holidayList.year);
      setDescription(holidayList.description);
      
      if (holidayList.holidays && holidayList.holidays.length > 0) {
        setHolidayCount(holidayList.holidays.length);
        setHolidays(
          holidayList.holidays.map((holiday) => ({
            id: holiday.id,
            name: holiday.name,
            date: holiday.date,
            description: holiday.description,
            isRecurring: holiday.isRecurring
          }))
        );
      }
    }
  }, [holidayList]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const newHolidayErrors: { [key: string]: { [field: string]: string } } = {};

    if (!name.trim()) {
      newErrors.name = 'Holiday list name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!year || year < 2000 || year > 2100) {
      newErrors.year = 'Please provide a valid year (2000-2100)';
    }

    // Validate holidays if any
    holidays.forEach((holiday, index) => {
      const holidayFieldErrors: { [field: string]: string } = {};
      
      if (!holiday.name.trim()) {
        holidayFieldErrors.name = 'Holiday name is required';
      }
      
      if (!holiday.date) {
        holidayFieldErrors.date = 'Date is required';
      }
      
      if (!holiday.description.trim()) {
        holidayFieldErrors.description = 'Description is required';
      }
      
      if (Object.keys(holidayFieldErrors).length > 0) {
        newHolidayErrors[index] = holidayFieldErrors;
      }
    });

    setErrors(newErrors);
    setHolidayErrors(newHolidayErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newHolidayErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const holidayListData = {
        name: name.trim(),
        year,
        description: description.trim(),
        status: holidayList?.status || HolidayStatus.DRAFT,
        holidays: holidays.map(holiday => ({
          name: holiday.name.trim(),
          date: holiday.date,
          description: holiday.description.trim(),
          isRecurring: holiday.isRecurring
        }))
      };
      
      onSave(holidayListData);
    }
  };

  const handleHolidayCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10) || 0;
    setHolidayCount(count);

    // Update holiday entries based on new count
    if (count > holidays.length) {
      // Add new empty holiday entries
      const newHolidays = [...holidays];
      for (let i = holidays.length; i < count; i++) {
        newHolidays.push({
          id: `temp-${i}`,
          name: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          description: '',
          isRecurring: false
        });
      }
      setHolidays(newHolidays);
    } else if (count < holidays.length) {
      // Remove excess holiday entries
      setHolidays(holidays.slice(0, count));
    }
  };

  const updateHolidayField = (index: number, field: keyof HolidayEntry, value: string | boolean) => {
    const updatedHolidays = [...holidays];
    updatedHolidays[index] = {
      ...updatedHolidays[index],
      [field]: value
    };
    setHolidays(updatedHolidays);
  };

  const removeHoliday = (index: number) => {
    const updatedHolidays = [...holidays];
    updatedHolidays.splice(index, 1);
    setHolidays(updatedHolidays);
    setHolidayCount(prevCount => prevCount - 1);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div className="flex justify-between items-center">
            <h2>{holidayList ? 'Edit Holiday List' : 'Create Holiday List'}</h2>
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  List Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter holiday list name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Year
                </label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - 2 + i}>
                      {new Date().getFullYear() - 2 + i}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter holiday list description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="holidayCount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Holidays
                </label>
                <input
                  type="number"
                  id="holidayCount"
                  min="0"
                  max="20"
                  value={holidayCount}
                  onChange={handleHolidayCountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {holidayCount > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Holiday Details</h3>
                  <div className="space-y-6">
                    {holidays.map((holiday, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50 relative">
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          onClick={() => removeHoliday(index)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={holiday.date}
                              onChange={(e) => updateHolidayField(index, 'date', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                                holidayErrors[index]?.date ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {holidayErrors[index]?.date && (
                              <p className="mt-1 text-sm text-red-600">{holidayErrors[index]?.date}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Holiday Name
                            </label>
                            <input
                              type="text"
                              value={holiday.name}
                              onChange={(e) => updateHolidayField(index, 'name', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                                holidayErrors[index]?.name ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Enter holiday name"
                            />
                            {holidayErrors[index]?.name && (
                              <p className="mt-1 text-sm text-red-600">{holidayErrors[index]?.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={holiday.description}
                              onChange={(e) => updateHolidayField(index, 'description', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                                holidayErrors[index]?.description ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Enter description"
                            />
                            {holidayErrors[index]?.description && (
                              <p className="mt-1 text-sm text-red-600">{holidayErrors[index]?.description}</p>
                            )}
                          </div>
                          <div className="md:col-span-3">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={holiday.isRecurring}
                                onChange={(e) => updateHolidayField(index, 'isRecurring', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">This holiday occurs every year</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {holidayList ? 'Save Changes' : 'Create List with Holidays'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayListModal; 