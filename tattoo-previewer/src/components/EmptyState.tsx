import React from 'react';
import { Upload } from "lucide-react";

interface EmptyStateProps {
  onBodyImageUpload: (file: File) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onBodyImageUpload }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Upload className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Quick Tattoo Preview</h2>
        <p className="text-gray-400 mb-6">
          Upload a body photo to get started with instant tattoo preview
        </p>
        <button
          onClick={() => document.getElementById("body-upload")?.click()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Upload Body Photo
        </button>
        <input
          id="body-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onBodyImageUpload(file);
          }}
        />
      </div>
    </div>
  );
}; 