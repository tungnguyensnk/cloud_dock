import { oauthClients } from './setup-oauth';
import GoogleDriveService from '../../lib/googleDrive';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const {code, state} = req.body;

  if (!code || !state) {
    return res.status(400).json({error: 'Missing authentication code or session ID'});
  }

  // get oauth client from temporary storage
  const clientInfo = oauthClients.get(state);
  if (!clientInfo) {
    return res.status(400).json({error: 'Invalid or expired session'});
  }

  try {
    const {oauth2Client} = clientInfo;

    // exchange code for tokens
    const {tokens} = await oauth2Client.getToken(code);

    // save refresh token to config file
    if (tokens.refresh_token) {
      const googleDriveService = new GoogleDriveService();
      googleDriveService.saveConfig(
        clientInfo.clientId,
        clientInfo.clientSecret,
        tokens.refresh_token
      );
    }

    // clean up temporary storage
    oauthClients.delete(state);

    res.json({
      success: true,
      message: 'Authentication successful',
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      error: 'Unable to get authentication token: ' + error.message
    });
  }
}