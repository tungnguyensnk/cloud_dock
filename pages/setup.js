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

      <div className="page-wrapper">
        <div className="container">
          <div className="header">
            <h1>🔧 Google Drive API Setup</h1>
            <p>Setup Google Drive connection for Cloud Dock</p>
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

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }



        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
          max-width: 600px;
          width: 100%;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #333;
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .header p {
          color: #666;
          font-size: 1.1em;
        }

        .step {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          border-left: 4px solid #007bff;
        }

        .step h3 {
          color: #007bff;
          margin-bottom: 10px;
          font-size: 1.2em;
        }

        .step ul {
          margin-left: 20px;
          color: #555;
        }

        .step li {
          margin-bottom: 5px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
        }

        .btn {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 123, 255, 0.3);
        }

        .btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .result {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }

        .result h3 {
          color: #155724;
          margin-bottom: 15px;
        }

        .result ol {
          margin-left: 20px;
          color: #155724;
        }

        .result li {
          margin-bottom: 5px;
        }

        .error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }

        .link {
          color: #007bff;
          text-decoration: none;
          font-weight: 600;
        }

        .link:hover {
          text-decoration: underline;
        }

        .loading {
          text-align: center;
          margin-top: 20px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        code {
          background: #f1f3f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
      `}</style>
    </>
  );
}