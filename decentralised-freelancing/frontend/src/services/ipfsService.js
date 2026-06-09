// frontend/src/services/ipfsService.js
// Handles all IPFS uploads via Pinata

import axios from 'axios';

const PINATA_API_KEY    = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;
const PINATA_GATEWAY    = process.env.REACT_APP_PINATA_GATEWAY
  || 'https://gateway.pinata.cloud/ipfs/';

const pinataAxios = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    pinata_api_key:        PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_KEY,
  },
});

const ipfsService = {

  // Upload a single file to IPFS
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app:       'TrustLance',
        timestamp: Date.now().toString(),
      },
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({ cidVersion: 0 });
    formData.append('pinataOptions', options);

    const response = await pinataAxios.post(
      '/pinning/pinFileToIPFS',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const pct = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(pct);
          }
        },
      }
    );

    const cid = response.data.IpfsHash;
    return {
      cid,
      url: PINATA_GATEWAY + cid,
    };
  },

  // Upload JSON metadata to IPFS
  uploadJSON: async (jsonData) => {
    const response = await pinataAxios.post(
      '/pinning/pinJSONToIPFS',
      {
        pinataContent:  jsonData,
        pinataMetadata: { name: 'TrustLance-metadata' },
      }
    );
    const cid = response.data.IpfsHash;
    return {
      cid,
      url: PINATA_GATEWAY + cid,
    };
  },

  // Upload multiple files
  uploadMultiple: async (files, onProgress) => {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const result = await ipfsService.uploadFile(
        files[i],
        (pct) => {
          if (onProgress) {
            const overall = Math.round(
              ((i + pct / 100) / files.length) * 100
            );
            onProgress(overall);
          }
        }
      );
      results.push(result);
    }
    return results;
  },

  // Get full URL from CID
  getUrl: (cid) => {
    if (!cid) return '';
    if (cid.startsWith('http')) return cid;
    return PINATA_GATEWAY + cid;
  },

  // Validate file before upload
  validateFile: (file, options = {}) => {
    const {
      maxSizeMB  = 10,
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    } = options;

    const errors = [];

    if (file.size > maxSizeMB * 1024 * 1024) {
      errors.push('File size must be under ' + maxSizeMB + 'MB');
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    return errors;
  },
};

export default ipfsService;