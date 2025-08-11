import GoogleDriveService from '../../../../lib/googleDrive';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const {fileId} = req.query;

  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: 'File ID is required'
    });
  }

  try {
    const googleDriveService = new GoogleDriveService();

    // get file metadata
    const metadata = await googleDriveService.drive.files.get({
      fileId: fileId,
      fields: 'id, name, size, mimeType, createdTime'
    });

    res.json({
      success: true,
      data: metadata.data
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file info',
      error: error.message
    });
  }
}