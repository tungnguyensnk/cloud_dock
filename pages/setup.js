import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Setup() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientId || !clientSecret) {
      setError('Please enter both CLIENT_ID and CLIENT_SECRET');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/setup-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          clientSecret
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // redirect to auth url
        window.open(data.authUrl, '_blank');
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Google Drive API Setup - Cloud Dock</title>
        <meta name="description" content="Setup Google Drive API for Cloud Dock"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>

      <div className="page-wrapper setup">
        <div className="container">
          <div className="header">
            <h1>Google Drive API Setup</h1>
          </div>

          <div className="step">
            <h3>📋 Step 1: Create OAuth Client ID</h3>
            <ul>
              <li>Open <a href="https://console.cloud.google.com/apis/credentials/oauthclient" target="_blank"
                          className="link">Google Cloud Console</a></li>
              <li>Select project (or create new one)</li>
              <li>Click "Create Credentials" → OAuth client ID</li>
              <li>Application type: <strong>Web application</strong></li>
              <li>Authorized redirect URIs: <code>http://localhost:3000/oauth2callback</code></li>
              <li>Save the <strong>Client ID</strong> and <strong>Client Secret</strong></li>
            </ul>
          </div>

          <div className="step">
            <h3>🔑 Step 2: Enable Google Drive API</h3>
            <ul>
              <li>Go to <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank"
                           className="link">Google Drive API</a></li>
              <li>Click "Enable" to activate the API</li>
            </ul>
          </div>

          <div className="step">
            <h3>⚙️ Step 3: Enter OAuth Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="clientId">Client ID:</label>
                <input
                  type="text"
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter Google OAuth Client ID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="clientSecret">Client Secret:</label>
                <input
                  type="password"
                  id="clientSecret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter Google OAuth Client Secret"
                  required
                />
              </div>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? '⏳ Processing...' : '🚀 Start Authentication'}
              </button>
            </form>
          </div>

          {error && (
            <div className="error">
              ❌ {error}
            </div>
          )}

          {result && (
            <div className="result">
              <h3>✅ Success!</h3>
              <p>Google authentication window has been opened. Please:</p>
              <ol>
                <li>Sign in to your Google account</li>
                <li>Allow the application to access Google Drive</li>
                <li>Copy the authentication code and return here</li>
              </ol>
              <p><strong>Note:</strong> After completion, you need to update the .env file with authentication
                information.</p>
            </div>
          )}

          <div className="loading" style={{display: loading ? 'block' : 'none'}}>
            <div className="spinner"></div>
            <p>Creating authentication link...</p>
          </div>

          <div style={{textAlign: 'center', marginTop: '30px'}}>
            <Link href="/" className="link">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>


    </>
  );
}