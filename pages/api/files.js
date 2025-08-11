import GoogleDriveService from '../../lib/googleDrive';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const googleDriveService = new GoogleDriveService();
    const files = await googleDriveService.listFiles(pageSize);

    res.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('List files error:', error);

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
      message: 'Failed to list files',
      error: error.message
    });
  }
}