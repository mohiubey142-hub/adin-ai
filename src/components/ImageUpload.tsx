import React, { useRef, useState } from 'react';
import { Image, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, imageData: any) => void;
  userId: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, userId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Max 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onImageUploaded(imageUrl, { name: file.name, size: file.size });
      toast.success('Image uploaded!');
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to upload image');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
        id="image-upload"
      />
      
      <label
        htmlFor="image-upload"
        className={`
          inline-flex items-center justify-center
          w-10 h-10 rounded-lg cursor-pointer transition-all
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
        `}
      >
        <Image size={20} className="text-gray-400 hover:text-white" />
      </label>
    </div>
  );
};

export default ImageUpload;