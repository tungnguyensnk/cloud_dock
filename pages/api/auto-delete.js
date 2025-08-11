import { getAutoDeleteService } from '../../lib/autoDeleteService';

export default async function handler(req, res) {
  const autoDeleteService = getAutoDeleteService();

  if (req.method === 'GET') {
    // get all scheduled deletions
    try {
      const scheduledDeletions = autoDeleteService.getScheduledDeletions();
      const isEnabled = autoDeleteService.isAutoDeleteEnabled();
      const delayMinutes = autoDeleteService.getAutoDeleteDelay();

      res.json({
        success: true,
        data: {
          enabled: isEnabled,
          delayMinutes: delayMinutes,
          scheduledDeletions: scheduledDeletions
        }
      });
    } catch (error) {
      console.error('Error getting scheduled deletions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get scheduled deletions',
        error: error.message
      });
    }
  } else if (req.method === 'DELETE') {
    // cancel scheduled deletion
    const {fileId} = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }

    try {
      const cancelled = autoDeleteService.cancelScheduledDeletion(fileId);

      if (cancelled) {
        res.json({
          success: true,
          message: 'Scheduled deletion cancelled successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'No scheduled deletion found for this file'
        });
      }
    } catch (error) {
      console.error('Error cancelling scheduled deletion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel scheduled deletion',
        error: error.message
      });
    }
  } else {
    res.status(405).json({message: 'Method not allowed'});
  }
}