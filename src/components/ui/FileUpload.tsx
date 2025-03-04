import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from './Button';

interface FileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  error?: string;
  value?: string;
  onChange: (value: string | null) => void;
  className?: string;
  maxSizeInMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  accept = 'image/*',
  error,
  value,
  onChange,
  className,
  maxSizeInMB = 2,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setLocalError(`File size exceeds ${maxSizeInMB}MB limit`);
      return;
    }
    
    setIsLoading(true);
    setLocalError(null);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setLocalError('Failed to read file');
        setIsLoading(false);
      };
    } catch (err) {
      console.error('Error processing file:', err);
      setLocalError('Failed to process file');
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const displayError = error || localError;
  const inputId = id || `file-upload-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          aria-invalid={!!displayError}
          aria-describedby={displayError ? `${inputId}-error` : undefined}
        />
        
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-32 rounded-md border border-gray-300 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
              aria-label="Remove image"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ) : (
          <div 
            onClick={handleClick}
            className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
          >
            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              PNG, JPG, GIF up to {maxSizeInMB}MB
            </p>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {preview ? 'Change Image' : 'Select Image'}
          </Button>
          
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
            >
              Remove
            </Button>
          )}
        </div>
        
        {displayError && (
          <p 
            className="text-sm text-red-500 dark:text-red-400" 
            id={`${inputId}-error`}
          >
            {displayError}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
