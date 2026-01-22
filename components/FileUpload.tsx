import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onClear, selectedFile, previewUrl }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile && previewUrl) {
    return (
      <div className="relative group border-2 border-brand-500 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full h-48 object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
            onClick={onClear}
            className="bg-white/90 text-red-600 px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white transition-colors"
           >
            <X size={18} /> 移除
           </button>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {selectedFile.name}
        </div>
      </div>
    );
  }

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-8 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 text-center group"
    >
      <input 
        type="file" 
        id="file-upload" 
        accept="image/*" 
        className="hidden" 
        onChange={handleChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-brand-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">上传截图</h3>
        <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
          拖放文档页面截图到这里，或点击浏览文件。
        </p>
        <p className="text-xs text-slate-400 mt-4">
          这有助于 AI 理解侧边栏结构。
        </p>
      </label>
    </div>
  );
};