import { google } from 'googleapis';
import GoogleDriveService from '../../lib/googleDrive';

// store oauth clients temporarily
const oauthClients = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const {clientId, clientSecret} = req.body;

  if (!clientId || !clientSecret) {
    return res.status(400).json({error: 'CLIENT_ID and CLIENT_SECRET are required'});
  }

  const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI
  );

  const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  // save client credentials to config file
  const googleDriveService = new GoogleDriveService();
  googleDriveService.saveConfig(clientId, clientSecret);

  // store client info temporarily
  const sessionId = Date.now().toString();
  oauthClients.set(sessionId, {
    oauth2Client,
    clientId,
    clientSecret
  });

  // add session id to auth url
  const urlWithSession = `${authUrl}&state=${sessionId}`;

  res.json({authUrl: urlWithSession});
}

export { oauthClients };