import GoogleDriveService from '../../lib/googleDrive';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  try {
    const {fileId} = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }

    const googleDriveService = new GoogleDriveService();
    await googleDriveService.deleteFile(fileId);
    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);

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
      message: 'Failed to delete file',
      error: error.message
    });
  }
}