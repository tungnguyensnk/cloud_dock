import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function OAuth2Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing authentication...');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [toast, setToast] = useState({show: false, message: '', type: ''});

  useEffect(() => {
    const handleCallback = async () => {
      const {code, state, error} = router.query;

      if (error) {
        setStatus('error');
        setMessage(`Authentication error: ${error}`);
        return;
      }

      if (!code || !state) {
        return; // still loading query params
      }

      try {
        const response = await fetch('/api/oauth-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({code, state})
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Authentication successful!');
          setTokenInfo(data.tokens);
        } else {
          setStatus('error');
          setMessage(data.error || 'An error occurred during authentication');
          console.error('OAuth callback error:', data);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Unable to connect to server');
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  const showToast = (message, type = 'success') => {
    setToast({show: true, message, type});
    setTimeout(() => {
      setToast({show: false, message: '', type: ''});
    }, 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Unable to copy', 'error');
    });
  };

  return (
    <>
      <Head>
        <title>OAuth Callback - Cloud Dock</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>

      <div className="page-wrapper oauth2callback">
        <div className="container">
          <div className="header">
            <h1>🔐 Google Drive Authentication</h1>
          </div>

          <div className="content">
            {status === 'processing' && (
              <div className="loading">
                <div className="spinner"></div>
                <p>{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="success">
                <h3>✅ {message}</h3>
                <p>Token has been saved to <code>config\google-config.json</code> with the following information:</p>

                {tokenInfo && (
                  <div className="token-section">
                    <div className="token-item">
                      <label>GOOGLE_REFRESH_TOKEN:</label>
                      <div className="token-value">
                        <code>{tokenInfo.refresh_token}</code>
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(tokenInfo.refresh_token)}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="instructions">
                  <h4>📝 Instructions:</h4>
                  <ol>
                    <li>Open the <code>.env</code> file in your project directory</li>
                    <li>Add or update the environment variables GOOGLE_REFRESH_TOKEN and the previous 2 variables
                      GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
                    </li>
                    <li>Restart the application</li>
                    <li>Now you can upload and download files from Google Drive!</li>
                  </ol>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="error">
                <h3>❌ Authentication Failed</h3>
                <p>{message}</p>
                <button
                  className="retry-btn"
                  onClick={() => router.push('/setup')}
                >
                  🔄 Try Again
                </button>
              </div>
            )}

            <div className="actions">
              <button
                className="home-btn"
                onClick={() => router.push('/')}
              >
                🏠 Back to Home
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toast.show && (
            <div className={`toast toast-${toast.type}`}>
              {toast.message}
            </div>
          )}
        </div>
      </div>


    </>
  );
}