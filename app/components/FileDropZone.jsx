// components/FileDropZone.js
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileDropZone = ({ onFileSelect }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed #ddd', padding: '20px', textAlign: 'center' }}>
      <input {...getInputProps()} />
      <p>Drag & drop an Excel file here, or click to select one</p>
    </div>
  );
};

export default FileDropZone;
