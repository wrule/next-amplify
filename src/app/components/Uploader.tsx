'use client';

import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  maxFiles?: number;
  maxSize?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles = 10,
  maxSize = 10
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfos, setFileInfos] = useState<{ name: string; size: string }[]>([]);
  const [width, setWidth] = useState<string>('100');
  const [height, setHeight] = useState<string>('70');
  const [interval, setInterval] = useState<string>('20');
  const [touched, setTouched] = useState({
    width: false,
    height: false,
    interval: false
  });

  const handleNumberInput = (
    value: string, 
    setter: (value: string) => void,
    field: 'width' | 'height' | 'interval'
  ) => {
    const numberValue = value.replace(/\D/g, '');
    const num = parseInt(numberValue);
    if (numberValue === '' || num > 0) {
      setter(numberValue);
    }
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: 'width' | 'height' | 'interval'): string => {
    if (!touched[field]) return '';
    const value = field === 'width' ? width : field === 'height' ? height : interval;
    if (!value) return '此字段为必填项';
    if (parseInt(value) <= 0) return '请输入大于0的数字';
    return '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (images.length + files.length > maxFiles) {
      alert(`最多只能上传${maxFiles}张图片`);
      return;
    }

    const processFile = async (file: File) => {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('请只上传 PNG, JPG 或 JPEG 格式的图片');
        return null;
      }

      if (file.size > maxSize * 1024 * 1024) {
        alert(`文件大小不能超过 ${maxSize}MB`);
        return null;
      }

      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });

        return {
          base64,
          fileInfo: {
            name: file.name,
            size: formatFileSize(file.size)
          }
        };
      } catch (error) {
        console.error('文件处理错误:', error);
        return null;
      }
    };

    const results = await Promise.all(Array.from(files).map(processFile));
    const validResults = results.filter((result): result is NonNullable<typeof result> => result !== null);

    setImages(prev => [...prev, ...validResults.map(r => r.base64)]);
    setFileInfos(prev => [...prev, ...validResults.map(r => r.fileInfo)]);
  }, [images.length, maxFiles, maxSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setFileInfos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const isValidInputs = (): boolean => {
    return Boolean(width && height && interval && 
      parseInt(width) > 0 && parseInt(height) > 0 && parseInt(interval) > 0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: '宽度', value: width, setter: setWidth, field: 'width' as const },
              { label: '高度', value: height, setter: setHeight, field: 'height' as const },
              { label: '播放间隔', value: interval, setter: setInterval, field: 'interval' as const }
            ].map(({ label, value, setter, field }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleNumberInput(e.target.value, setter, field)}
                  onBlur={() => setTouched(prev => ({ ...prev, [field]: true }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500
                    ${getFieldError(field) ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="输入大于0的数字"
                />
                {getFieldError(field) && (
                  <p className="mt-1 text-xs text-red-500">{getFieldError(field)}</p>
                )}
              </div>
            ))}
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">图片上传</h2>
          <p className="text-sm text-gray-500">支持格式: PNG, JPG, JPEG</p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${images.length === 0 ? 'h-48' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            accept=".png,.jpg,.jpeg"
            multiple
          />

          {images.length === 0 ? (
            <div className="text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 48 48"
              >
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <p className="mt-1 text-sm text-gray-600">点击上传或拖拽图片到此处</p>
              <p className="mt-1 text-xs text-gray-500">
                支持 PNG, JPG, JPEG 格式，单个文件最大 {maxSize}MB
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt={`上传图片 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="mt-1 text-xs text-gray-500">
                    <p className="truncate">{fileInfos[index]?.name}</p>
                    <p>{fileInfos[index]?.size}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              已上传 {images.length} / {maxFiles} 张图片
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => console.log({ width, height, interval, images })}
            disabled={images.length === 0 || !isValidInputs()}
            className={`w-full py-2 px-4 rounded-md transition-colors
              ${images.length > 0 && isValidInputs()
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            生成
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;