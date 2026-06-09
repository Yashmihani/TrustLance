// frontend/src/components/common/FileUpload.jsx
import { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FileUpload = ({ onUpload, maxFiles, maxSizeMB, accept, label }) => {
  const resolvedMaxFiles  = maxFiles  || 5;
  const resolvedMaxSizeMB = maxSizeMB || 10;
  const resolvedAccept    = accept    || 'image/*,.pdf,.doc,.docx';
  const resolvedLabel     = label     || 'Upload Files';

  const [files,       setFiles]       = useState([]);
  const [isDragging,  setIsDragging]  = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress,    setProgress]    = useState(0);
  const fileInputRef                  = useRef(null);

  const getFileIcon = (type) => {
    if (type === 'image/jpeg' || type === 'image/png' || type === 'image/gif') {
      return <FiImage className="text-blue-500" />;
    }
    if (type === 'application/pdf') {
      return <FiFileText className="text-red-500" />;
    }
    return <FiFile className="text-gray-500" />;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const validateFile = (file) => {
    const maxBytes = resolvedMaxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return 'File size must be under ' + resolvedMaxSizeMB + 'MB';
    }
    return null;
  };

  const uploadToIPFS = async (file, onProg) => {
    const PINATA_API_KEY    = process.env.REACT_APP_PINATA_API_KEY;
    const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;
    const GATEWAY           = process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({ name: file.name }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.pinata.cloud/pinning/pinFileToIPFS');
      xhr.setRequestHeader('pinata_api_key', PINATA_API_KEY);
      xhr.setRequestHeader('pinata_secret_api_key', PINATA_SECRET_KEY);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProg) {
          onProg(Math.round((e.loaded * 100) / e.total));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve({ cid: data.IpfsHash, url: GATEWAY + data.IpfsHash });
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  };

  const handleFiles = async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);

    if (files.length + fileArray.length > resolvedMaxFiles) {
      toast.error('Maximum ' + resolvedMaxFiles + ' files allowed');
      return;
    }

    for (let i = 0; i < fileArray.length; i++) {
      const err = validateFile(fileArray[i]);
      if (err) {
        toast.error(fileArray[i].name + ': ' + err);
        return;
      }
    }

    setIsUploading(true);
    setProgress(0);

    try {
      toast.loading('Uploading to IPFS...', { id: 'file-upload' });

      const newFiles = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file   = fileArray[i];
        const result = await uploadToIPFS(file, (pct) => {
          const overall = Math.round(((i + pct / 100) / fileArray.length) * 100);
          setProgress(overall);
        });
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          cid:  result.cid,
          url:  result.url,
        });
      }

      const updated = [...files, ...newFiles];
      setFiles(updated);
      onUpload(updated.map(f => f.url));
      toast.success(newFiles.length + ' file(s) uploaded!', { id: 'file-upload' });

    } catch (error) {
      toast.error('Upload failed. Check your Pinata API keys.', { id: 'file-upload' });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onUpload(updated.map(f => f.url));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const maxLabel      = 'Max ' + resolvedMaxFiles + ' files, ' + resolvedMaxSizeMB + 'MB each';
  const progressLabel = 'Uploading to IPFS... ' + progress + '%';
  const progressStyle = { width: progress + '%' };

  const dropClass = isDragging
    ? 'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer border-cyan-500 bg-cyan-50'
    : 'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer border-gray-200 hover:border-ink-900 hover:bg-gray-50';

  return (
    <div className="space-y-3">

      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={handleClick}
        className={dropClass}
      >
        {isUploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">{progressLabel}</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={progressStyle} />
            </div>
          </div>
        ) : (
          <div>
            <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-sm font-medium text-gray-600">{resolvedLabel}</p>
            <p className="text-xs text-gray-400 mt-1">Drag and drop or click to browse</p>
            <p className="text-xs text-gray-400">{maxLabel}</p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const sizeLabel = formatSize(file.size) + ' • Stored on IPFS';
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">

                <div className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{sizeLabel}</p>
                </div>

                
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-600 hover:underline flex-shrink-0"
                  onClick={e => e.stopPropagation()}
                
                  View
                

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <FiX size={14} />
                </button>

              </div>
            );
          })}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={resolvedAccept}
        multiple={resolvedMaxFiles > 1}
        onChange={handleInputChange}
        className="hidden"
      />

    </div>
  );
};

export default FileUpload;