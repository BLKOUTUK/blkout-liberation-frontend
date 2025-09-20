// Placeholder NewsSubmissionForm component
import React from 'react';

interface NewsSubmissionFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function NewsSubmissionForm({ onSubmit, onCancel }: NewsSubmissionFormProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">News Submission Form</h3>
      <p className="text-gray-600 mb-4">News submission functionality coming soon.</p>
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit?.({})}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}