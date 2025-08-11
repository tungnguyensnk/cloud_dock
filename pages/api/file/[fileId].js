import GoogleDriveService from '../../../lib/googleDrive';

export default async function handler(req, res) {
  const {fileId} = req.query;

  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: 'File ID is required'
    });
  }

  const googleDriveService = new GoogleDriveService();

  if (req.method === 'GET') {
    try {
      const {filename} = req.query; // optional filename from frontend

      // get file stream directly (single API call)
      const fileStream = await googleDriveService.getFileStream(fileId);

      // set headers with filename if provided
      res.setHeader('Content-Type', 'application/octet-stream');
      const downloadFilename = filename || `download_${fileId}`;
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);

      // pipe file stream to response
      fileStream.pipe(res);

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get file',
        error: error.message
      });
    }
  } else {
    res.status(405).json({message: 'Method not allowed'});
  }
}