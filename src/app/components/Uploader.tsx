'use client';

import React, { useState, useCallback, type ChangeEvent } from 'react';

interface ImageUploaderProps {
  maxFiles?: number;
  maxSize?: number; // MB
}

interface FileInfo {
  name: string;
  size: string;
  preview: string;
}

interface AlertProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => (
  <div 
    className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 
    animate-slideIn backdrop-blur-sm
    ${type === 'success' ? 'bg-[#FFD93D]/90 text-yellow-900' : 'bg-red-500/90 text-white'}`}
  >
    <span className="font-medium">{message}</span>
    <button 
      onClick={onClose} 
      className="text-current hover:opacity-75 transition-opacity"
    >
      ×
    </button>
  </div>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles = 10,
  maxSize = 10
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);
  const [width, setWidth] = useState('100');
  const [height, setHeight] = useState('70');
  const [interval, setInterval] = useState('20');
  const [loading, setLoading] = useState(false);
  const [generatedGif, setGeneratedGif] = useState('');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [shake, setShake] = useState(false);

  const showAlert = useCallback((message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.match(/^image\/(png|jpe?g)$/)) {
      showAlert('请只上传 PNG, JPG 或 JPEG 格式的图片', 'error');
      return null;
    }

    if (file.size > maxSize * 1024 * 1024) {
      showAlert(`文件大小不能超过 ${maxSize}MB`, 'error');
      return null;
    }

    try {
      return new Promise<{ base64: string; fileInfo: FileInfo } | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve({
            base64: result.split(',')[1],
            fileInfo: {
              name: file.name,
              size: formatFileSize(file.size),
              preview: result
            }
          });
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('文件处理错误:', error);
      showAlert('文件处理失败', 'error');
      return null;
    }
  }, [maxSize, formatFileSize, showAlert]);

  const handleFiles = useCallback(async (files: FileList) => {
    if (images.length + files.length > maxFiles) {
      showAlert(`最多只能上传${maxFiles}张图片`, 'error');
      return;
    }

    const results = await Promise.all(Array.from(files).map(processFile));
    const validResults = results.filter((result): result is NonNullable<typeof result> => result !== null);

    setImages(prev => [...prev, ...validResults.map(r => r.base64)]);
    setFileInfos(prev => [...prev, ...validResults.map(r => r.fileInfo)]);
  }, [images.length, maxFiles, processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    e.target.value = '';
  }, [handleFiles]);

  const handleUploadClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    document.getElementById('fileInput')?.click();
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setFileInfos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleNumberInput = useCallback((
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const value = e.target.value.replace(/\D/g, '');
    setter(value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (images.length === 0 || loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          width: parseInt(width) || 100,
          height: parseInt(height) || 70,
          interval: parseInt(interval) || 20,
          images
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setGeneratedGif(`data:image/gif;base64,${data.data.gif}`);
      showAlert('生成成功！', 'success');
      setShake(true);
      setTimeout(() => setShake(false), 1000);
    } catch (error) {
      console.error('上传错误:', error);
      showAlert('生成失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  }, [images, width, height, interval, loading, showAlert]);

  const handleDownload = useCallback(() => {
    if (!generatedGif) return;
    
    const link = document.createElement('a');
    link.href = generatedGif;
    link.download = `generated-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedGif]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <div
        className={`relative transition-all duration-300 ease-in-out
          ${isDragging ? 'transform scale-105' : 'hover:scale-[1.02]'}`}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${isDragging 
              ? 'border-[#FFD93D] bg-[#FFD93D]/10' 
              : 'border-gray-300 hover:border-[#FFD93D] hover:bg-[#FFD93D]/5'}`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileInput}
            multiple
            className="hidden"
            id="fileInput"
          />
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#FFD93D]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-[#FFD93D] hover:text-[#FFC93D] transition-colors">
                点击上传
              </span>
              <span className="text-gray-500 ml-2">或将文件拖放到此处</span>
            </div>
            <p className="text-sm text-gray-500">
              支持 PNG、JPG 格式，每个文件不超过 {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {fileInfos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fileInfos.map((file, index) => (
            <div 
              key={index} 
              className="relative group animate-fadeIn"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 
                         group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                aria-label="删除图片"
              >
                ×
              </button>
              <div className="mt-2 text-sm text-gray-500 truncate px-1">
                {file.name}
                <div className="text-xs text-gray-400">
                  {file.size}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '宽度', value: width, setter: setWidth },
          { label: '高度', value: height, setter: setHeight },
          { label: '间隔', value: interval, setter: setInterval }
        ].map((field) => (
          <div key={field.label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.label === '间隔' ? '(毫秒)' : '(像素)'}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={e => handleNumberInput(e, field.setter)}
              className="w-full px-3 py-2 border rounded-lg transition-all duration-200
                       border-gray-300 focus:border-[#FFD93D] focus:ring-2 focus:ring-[#FFD93D]/20
                       focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={images.length === 0 || loading}
        className={`w-full py-3 px-4 rounded-lg text-yellow-900 font-medium transition-all duration-300
          ${images.length === 0 || loading
            ? 'bg-gray-200 cursor-not-allowed'
            : 'bg-[#FFD93D] hover:bg-[#FFC93D] hover:shadow-lg hover:shadow-[#FFD93D]/20 active:transform active:scale-95'
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            处理中...
          </span>
        ) : '生成 GIF'}
      </button>

      {generatedGif && (
        <div className="flex flex-col items-center space-y-4 animate-fadeIn">
          <h3 className="text-lg font-medium text-gray-800">生成的 GIF</h3>
          <div className={`relative rounded-lg overflow-hidden shadow-2xl
            ${shake ? 'animate-shake' : ''}`}>
            <img
              src={generatedGif}
              alt="Generated GIF"
              className="max-w-full h-auto"
            />
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-[#FFD93D] text-yellow-900 rounded-lg font-medium
                     hover:bg-[#FFC93D] transition-all duration-300 hover:shadow-lg 
                     hover:shadow-[#FFD93D]/20 active:transform active:scale-95"
          >
            下载 GIF
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;