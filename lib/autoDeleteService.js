import GoogleDriveService from './googleDrive.js';

class AutoDeleteService {
  constructor() {
    this.googleDriveService = new GoogleDriveService();
    this.scheduledDeletions = new Map(); // store scheduled deletions
  }

  // schedule file for auto deletion
  scheduleFileDeletion(fileId, fileName, delayMinutes) {
    if (!process.env.AUTO_DELETE) {
      return null; // auto delete is disabled
    }

    const deleteAfterMinutes = parseInt(process.env.AUTO_DELETE) || delayMinutes;
    const deleteTime = Date.now() + (deleteAfterMinutes * 60 * 1000);

    console.log(`Scheduling file ${fileName} (${fileId}) for deletion in ${deleteAfterMinutes} minutes`);

    const timeoutId = setTimeout(async () => {
      try {
        await this.googleDriveService.deleteFile(fileId);
        console.log(`Auto-deleted file: ${fileName} (${fileId})`);
        this.scheduledDeletions.delete(fileId);
      } catch (error) {
        console.error(`Failed to auto-delete file ${fileName} (${fileId}):`, error);
        this.scheduledDeletions.delete(fileId);
      }
    }, deleteAfterMinutes * 60 * 1000);

    // store the scheduled deletion info
    this.scheduledDeletions.set(fileId, {
      fileName,
      deleteTime,
      timeoutId
    });

    return {
      fileId,
      fileName,
      deleteTime: new Date(deleteTime).toISOString(),
      deleteAfterMinutes
    };
  }

  // cancel scheduled deletion
  cancelScheduledDeletion(fileId) {
    const scheduled = this.scheduledDeletions.get(fileId);
    if (scheduled) {
      clearTimeout(scheduled.timeoutId);
      this.scheduledDeletions.delete(fileId);
      console.log(`Cancelled scheduled deletion for file: ${scheduled.fileName} (${fileId})`);
      return true;
    }
    return false;
  }

  // get all scheduled deletions
  getScheduledDeletions() {
    const result = [];
    for (const [fileId, info] of this.scheduledDeletions) {
      result.push({
        fileId,
        fileName: info.fileName,
        deleteTime: new Date(info.deleteTime).toISOString(),
        remainingMinutes: Math.max(0, Math.ceil((info.deleteTime - Date.now()) / (60 * 1000)))
      });
    }
    return result;
  }

  // check if auto delete is enabled
  isAutoDeleteEnabled() {
    return !!process.env.AUTO_DELETE;
  }

  // get auto delete delay in minutes
  getAutoDeleteDelay() {
    return parseInt(process.env.AUTO_DELETE) || 0;
  }
}

// singleton instance
let autoDeleteServiceInstance = null;

export function getAutoDeleteService() {
  if (!autoDeleteServiceInstance) {
    autoDeleteServiceInstance = new AutoDeleteService();
  }
  return autoDeleteServiceInstance;
}

export default AutoDeleteService;