import React, { useState, useRef } from 'react';
import type { ImageData } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onImageChange: (imageData: ImageData | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, icon, onImageChange }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setImagePreview(base64String);
          onImageChange({
            base64: base64String.split(',')[1],
            mimeType: file.type,
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert('유효한 이미지 파일을 선택해주세요.');
      }
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div 
        onClick={handleAreaClick}
        className="group relative w-full aspect-square bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-300 flex items-center justify-center cursor-pointer overflow-hidden"
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-500">
            <div className="flex justify-center mb-2">
              {icon}
            </div>
            <p className="text-sm">클릭하여 업로드</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <UploadIcon className="h-10 w-10 text-white" />
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;