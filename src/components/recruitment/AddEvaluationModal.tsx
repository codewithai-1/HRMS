import React, { useState } from 'react';

interface AddEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    evaluatorName: string;
    score: number;
    comments: string;
  }) => void;
}

const AddEvaluationModal = ({ isOpen, onClose, onSubmit }: AddEvaluationModalProps) => {
  const [formData, setFormData] = useState({
    evaluatorName: '',
    score: 3,
    comments: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg w-full max-w-md p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">Add Evaluation</h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide your evaluation of the candidate.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="evaluatorName" className="block text-sm font-medium text-gray-700">
                Evaluator Name
              </label>
              <input
                type="text"
                id="evaluatorName"
                value={formData.evaluatorName}
                onChange={(e) => setFormData(prev => ({ ...prev, evaluatorName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="score" className="block text-sm font-medium text-gray-700">
                Score (1-5)
              </label>
              <div className="mt-1 flex items-center gap-4">
                <input
                  type="range"
                  id="score"
                  min="1"
                  max="5"
                  value={formData.score}
                  onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-lg font-medium text-gray-900">{formData.score}</span>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Provide detailed feedback about the candidate..."
                required
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Evaluation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEvaluationModal; 