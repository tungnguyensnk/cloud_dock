import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleDriveService {
  constructor() {
    // load config from file first, fallback to environment variables
    const config = this.loadConfig();

    this.auth = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      config.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI
    );

    const refreshToken = config.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;
    if (refreshToken) {
      this.auth.setCredentials({
        refresh_token: refreshToken
      });
    }

    this.drive = google.drive({version: 'v3', auth: this.auth});
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '..', 'config', 'google-config.json');
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8').trim();
        // check if file is empty or contains only whitespace
        if (!configData) {
          return {};
        }
        // return config if it exists, priority: config file > environment variables
        return JSON.parse(configData);
      }
    } catch (error) {
      console.error('Error loading config file:', error);
    }
    return {};
  }

  saveConfig(clientId, clientSecret, refreshToken = null) {
    try {
      const configPath = path.join(__dirname, '..', 'config', 'google-config.json');

      // read existing config to preserve values
      let existingConfig = {};
      if (fs.existsSync(configPath)) {
        try {
          const existingData = fs.readFileSync(configPath, 'utf8');
          existingConfig = JSON.parse(existingData);
        } catch (e) {
          // ignore parse errors, use empty config
        }
      }

      const config = {
        GOOGLE_CLIENT_ID: clientId || existingConfig.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: clientSecret || existingConfig.GOOGLE_CLIENT_SECRET || '',
        GOOGLE_REFRESH_TOKEN: refreshToken || existingConfig.GOOGLE_REFRESH_TOKEN || ''
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving config file:', error);
      return false;
    }
  }

  // upload file to google drive
  async uploadFile(fileBuffer, fileName, mimeType) {
    try {
      const fileMetadata = {
        name: fileName
      };

      const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, size, mimeType, createdTime'
      });

      // make file publicly accessible
      await this.drive.permissions.create({
        fileId: response.data.id,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return {
        id: response.data.id,
        name: response.data.name,
        size: response.data.size,
        mimeType: response.data.mimeType,
        createdTime: response.data.createdTime,
        downloadUrl: `https://drive.google.com/uc?id=${response.data.id}`
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  // get file from google drive (optimized - single API call)
  async getFile(fileId) {
    try {
      // get metadata first for response headers
      const fileMetadata = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, size, mimeType, createdTime'
      });

      // get file stream
      const fileStream = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {responseType: 'stream'});

      return {
        metadata: fileMetadata.data,
        stream: fileStream.data
      };
    } catch (error) {
      console.error('Error getting file:', error);
      throw new Error('Failed to get file from Google Drive');
    }
  }

  // get file stream only (for direct download - single API call)
  async getFileStream(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {responseType: 'stream'});

      return response.data;
    } catch (error) {
      console.error('Error getting file stream:', error);
      throw new Error('Failed to get file stream from Google Drive');
    }
  }

  // list files in drive
  async listFiles(pageSize = 10) {
    try {
      const response = await this.drive.files.list({
        pageSize: pageSize,
        fields: 'files(id, name, size, mimeType, createdTime)'
      });

      return response.data.files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files from Google Drive');
    }
  }

  // delete file from google drive
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });

      return {success: true, message: 'File deleted successfully'};
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file from Google Drive');
    }
  }
}

export default GoogleDriveService;