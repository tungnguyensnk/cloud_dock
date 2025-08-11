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
            <div className="setup-icon">🔧</div>
            <h1>Google Drive API Setup</h1>
            <p>Configure your Google Drive integration in 3 simple steps</p>
          </div>


          <div className="setup-content">
            <div className="setup-step-card">
              <div className="step-header">
                <div className="step-icon">📋</div>
                <div>
                  <h3>Step 1: Create OAuth Client ID</h3>
                  <p>Set up your Google Cloud Console credentials</p>
                </div>
              </div>
              <div className="step-content">
                <div className="instruction-list">
                  <div className="instruction-item">
                    <span className="instruction-number">1</span>
                    <div>
                      <strong>Open Google Cloud Console</strong>
                      <p>Go to <a href="https://console.cloud.google.com/apis/credentials/oauthclient" target="_blank"
                                  className="external-link">Google Cloud Console <span>↗</span></a></p>
                    </div>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-number">2</span>
                    <div>
                      <strong>Create OAuth Client</strong>
                      <p>Select project → Create Credentials → OAuth client ID</p>
                    </div>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-number">3</span>
                    <div>
                      <strong>Configure Application</strong>
                      <p>Application type: <span className="highlight">Web application</span></p>
                      <p>Redirect URI: <code className="code-snippet">http://localhost:3000/oauth2callback</code></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="setup-step-card">
              <div className="step-header">
                <div className="step-icon">🔑</div>
                <div>
                  <h3>Step 2: Enable Google Drive API</h3>
                  <p>Activate the Google Drive API for your project</p>
                </div>
              </div>
              <div className="step-content">
                <div className="api-enable-card">
                  <div className="api-info">
                    <div className="api-icon">📁</div>
                    <div>
                      <strong>Google Drive API</strong>
                      <p>Required for file operations</p>
                    </div>
                  </div>
                  <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank"
                     className="enable-btn">
                    Enable API <span>↗</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="setup-step-card">
              <div className="step-header">
                <div className="step-icon">⚙️</div>
                <div>
                  <h3>Step 3: Enter OAuth Credentials</h3>
                  <p>Input your Client ID and Client Secret</p>
                </div>
              </div>
              <div className="step-content">
                <form onSubmit={handleSubmit} className="oauth-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="clientId">
                        <span className="label-icon">🆔</span>
                        Client ID
                      </label>
                      <input
                        type="text"
                        id="clientId"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Enter your Google OAuth Client ID"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="clientSecret">
                        <span className="label-icon">🔐</span>
                        Client Secret
                      </label>
                      <input
                        type="password"
                        id="clientSecret"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        placeholder="Enter your Google OAuth Client Secret"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🚀</span>
                        Start Authentication
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <div className="alert-icon">❌</div>
                <div className="alert-content">
                  <strong>Error</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="setup-step-card success-card">
                <div className="step-header">
                  <div className="step-icon success">✅</div>
                  <div>
                    <h3>Step 4: Complete Authentication</h3>
                    <p>Finish the OAuth process</p>
                  </div>
                </div>
                <div className="step-content">
                  <div className="success-message">
                    <p><strong>Authentication window opened!</strong></p>
                    <div className="auth-instructions">
                      <div className="auth-step">
                        <span className="auth-step-number">1</span>
                        <span>Sign in to your Google account</span>
                      </div>
                      <div className="auth-step">
                        <span className="auth-step-number">2</span>
                        <span>Grant permissions to Cloud Dock</span>
                      </div>
                      <div className="auth-step">
                        <span className="auth-step-number">3</span>
                        <span>Complete the authorization process</span>
                      </div>
                    </div>
                    <div className="final-note">
                      <div className="note-icon">💡</div>
                      <p><strong>Next:</strong> Update your .env file with the generated credentials</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="setup-footer">
            <Link href="/" className="back-home-link">
              <span>←</span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}