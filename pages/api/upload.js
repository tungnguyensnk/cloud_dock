import multer from 'multer';
import GoogleDriveService from '../../lib/googleDrive';
import { getAutoDeleteService } from '../../lib/autoDeleteService';

// configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB limit
  }
});

// helper function to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  try {
    // run multer middleware
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const {buffer, originalname, mimetype} = req.file;

    // initialize google drive service
    const googleDriveService = new GoogleDriveService();

    // upload to google drive
    const uploadResult = await googleDriveService.uploadFile(
      buffer,
      originalname,
      mimetype
    );

    // schedule auto deletion if enabled
    const autoDeleteService = getAutoDeleteService();
    let autoDeleteInfo = null;

    if (autoDeleteService.isAutoDeleteEnabled()) {
      autoDeleteInfo = autoDeleteService.scheduleFileDeletion(
        uploadResult.id,
        uploadResult.name,
        autoDeleteService.getAutoDeleteDelay()
      );
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        ...uploadResult,
        autoDelete: autoDeleteInfo
      }
    });

  } catch (error) {
    console.error('Upload error:', error);

    // check if error is related to missing credentials
    if (error.message.includes('No access, refresh token, API key') ||
      error.message.includes('invalid_grant') ||
      error.message.includes('unauthorized')) {
      return res.status(401).json({
        success: false,
        message: 'Google Drive API not configured properly',
        error: 'Please setup Google Drive API credentials first',
        needsSetup: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};