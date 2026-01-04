import React, { useRef, useState } from 'react';
import { Upload, ImageIcon } from './Icons';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative group cursor-pointer 
        border-2 border-dashed rounded-2xl 
        flex flex-col items-center justify-center 
        h-64 md:h-80 w-full transition-all duration-300
        ${isDragging 
          ? 'border-accent-500 bg-accent-500/10' 
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onInputChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-4 text-center p-6">
        <div className={`
          p-4 rounded-full transition-transform duration-300 group-hover:scale-110
          ${isDragging ? 'bg-accent-500/20 text-accent-500' : 'bg-gray-700 text-gray-400'}
        `}>
          {isDragging ? <Upload size={32} /> : <ImageIcon size={32} />}
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-200">
            {isDragging ? 'Drop image here' : 'Upload a photo to analyze'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Drag & drop or click to browse
          </p>
        </div>
        
        <div className="text-xs text-gray-600 uppercase tracking-widest font-semibold mt-4">
          Supports JPG, PNG, WEBP
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
