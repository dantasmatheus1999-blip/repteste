import React, { useState, useRef } from 'react';
import { User, Camera, X } from 'lucide-react';

interface AvatarUploaderProps {
  onFileSelect: (file: File | null) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const removeAvatar = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full border-2 border-gold/30 bg-black/40 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.1)] group-hover:border-gold/60 transition-all duration-500">
          {preview ? (
            <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-gold/20" />
          )}
        </div>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-gold text-mythos-bg shadow-lg hover:scale-110 transition-transform duration-300"
        >
          <Camera size={16} />
        </button>

        {preview && (
          <button
            type="button"
            onClick={removeAvatar}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-health/80 text-white shadow-lg hover:scale-110 transition-transform duration-300"
          >
            <X size={12} />
          </button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <p className="text-[10px] text-gold/40 uppercase font-black tracking-[0.2em]">
        {preview ? 'Avatar Selecionado' : 'Escolher Avatar (Opcional)'}
      </p>
    </div>
  );
};
