import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileUploaded: (fileName: string, fileContent: string) => void;
}

export interface FileUploadRef {
  clearFile: () => void;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(({ onFileUploaded }, ref) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    clearFile: () => {
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }));

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB');
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileName(file.name);
      onFileUploaded(file.name, content);
      toast.success(`"${file.name}" uploaded!`);
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to upload file');
      setIsUploading(false);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearFile = () => {
    setFileName(null);
  };

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      
      {fileName ? (
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-2 py-1">
          <FileText size={14} className="text-blue-400" />
          <span className="text-xs text-gray-300 max-w-[100px] truncate">{fileName}</span>
          <button onClick={clearFile} className="hover:text-red-400">
            <X size={12} />
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className={`
            inline-flex items-center justify-center
            w-10 h-10 rounded-lg cursor-pointer transition-all
            ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
          `}
        >
          <FileText size={20} className="text-gray-400 hover:text-white" />
        </label>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;