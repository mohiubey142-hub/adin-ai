import React, { useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';

interface CoverLetterPhotoUploadProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
}

const CoverLetterPhotoUpload: React.FC<CoverLetterPhotoUploadProps> = ({ photo, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onPhotoChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Photo Circle */}
      <div className="relative">
        <div className={`
          w-20 h-20 rounded-full border-2 border-purple-500/30 
          flex items-center justify-center overflow-hidden
          bg-gradient-to-br from-gray-800 to-gray-900
          shadow-lg shadow-purple-500/20
          transition-all duration-300 hover:shadow-purple-500/40
        `}>
          {photo ? (
            <img 
              src={photo} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera size={28} className="text-gray-500" />
          )}
        </div>
        
        {/* Premium Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-md -z-10" />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 
                     text-white text-xs font-medium transition-all duration-300 
                     hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center gap-2"
        >
          <Upload size={14} />
          {photo ? 'Change Photo' : 'Upload Photo'}
        </button>
        
        {photo && (
          <button
            onClick={handleRemovePhoto}
            className="px-4 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 
                       text-white text-xs font-medium transition-all duration-300 
                       hover:scale-105 flex items-center gap-2"
          >
            <X size={14} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default CoverLetterPhotoUpload;