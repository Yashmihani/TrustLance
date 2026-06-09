// frontend/src/components/common/AvatarUpload.jsx
// Drag and drop or click to upload profile picture to IPFS

import { useState, useRef }   from 'react';
import { FiCamera, FiX }      from 'react-icons/fi';
import ipfsService             from '../../services/ipfsService';
import Spinner                 from './Spinner';
import toast                   from 'react-hot-toast';

const AvatarUpload = ({ currentAvatar, name, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [preview,     setPreview]     = useState(currentAvatar || '');
  const fileInputRef                  = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    const errors = ipfsService.validateFile(file, {
      maxSizeMB:    5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to IPFS
    setIsUploading(true);
    setProgress(0);

    try {
      toast.loading('Uploading to IPFS...', { id: 'avatar-upload' });

      const result = await ipfsService.uploadFile(file, (pct) => {
        setProgress(pct);
      });

      setPreview(result.url);
      onUpload(result.url);

      toast.success('Profile picture uploaded!', { id: 'avatar-upload' });

    } catch (error) {
      toast.error('Upload failed. Check your Pinata API keys.', {
        id: 'avatar-upload',
      });
      console.error('IPFS upload error:', error);
      setPreview(currentAvatar || '');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Get initials for fallback
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex flex-col items-center gap-3">

      {/* Avatar display */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4
                        border-white shadow-md">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-ink-900 flex items-center
                            justify-center text-cyan-400 text-2xl font-bold">
              {initials}
            </div>
          )}

          {/* Upload overlay */}
          {!isUploading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 opacity-0
                         group-hover:opacity-100 transition-opacity
                         flex items-center justify-center rounded-full"
            >
              <FiCamera className="text-white" size={24} />
            </button>
          )}

          {/* Progress overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col
                            items-center justify-center rounded-full">
              <Spinner size="sm" color="cyan" />
              <span className="text-white text-xs mt-1">{progress}%</span>
            </div>
          )}
        </div>

        {/* Remove button */}
        {preview && !isUploading && (
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500
                       hover:bg-red-600 text-white rounded-full flex
                       items-center justify-center transition-colors"
          >
            <FiX size={12} />
          </button>
        )}
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="text-sm text-cyan-600 hover:text-ink-900 font-medium
                   transition-colors disabled:opacity-50"
      >
        {isUploading
          ? 'Uploading ' + progress + '%...'
          : preview ? 'Change photo' : 'Upload photo'
        }
      </button>

      <p className="text-xs text-gray-400">
        JPG, PNG, GIF up to 5MB
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

    </div>
  );
};

export default AvatarUpload;