const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'other';
    const mimetype = file.mimetype;

    if (mimetype.startsWith('image/')) {
      folder = 'images';
    } else if (mimetype === 'application/pdf') {
      folder = 'papers';
    } else if (
      mimetype === 'text/csv' || 
      mimetype === 'application/json' || 
      mimetype === 'application/vnd.ms-excel' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      folder = 'datasets';
    }

    const uploadPath = path.join('uploads', folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'text/csv', 'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Images, PDFs, and Datasets are allowed.'), false);
  }
};

// Limits configuration (in bytes)
const limits = {
  fileSize: (req, file, cb) => {
    const mimetype = file.mimetype;
    let limit = 5 * 1024 * 1024; // Default 5MB

    if (mimetype === 'application/pdf') {
      limit = 25 * 1024 * 1024; // 25MB for PDFs
    } else if (mimetype.includes('csv') || mimetype.includes('spreadsheet') || mimetype.includes('json')) {
      limit = 50 * 1024 * 1024; // 50MB for Datasets
    }

    return limit;
  }
};

// Custom limits handler because Multer's limits object doesn't support dynamic fileSize easily per file in a single middleware instance
// We will use a wrapper to check size if needed, but for now we set a max and check more specifically in controller or custom wrapper
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Absolute max 50MB
  }
});

module.exports = upload;
