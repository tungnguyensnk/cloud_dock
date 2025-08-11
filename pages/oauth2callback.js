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

      <div className="page-wrapper">
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
              max-width: 700px;
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

          .loading {
              text-align: center;
              padding: 40px;
          }

          .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #007bff;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
          }

          @keyframes spin {
              0% {
                  transform: rotate(0deg);
              }
              100% {
                  transform: rotate(360deg);
              }
          }

          .success {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              border-radius: 10px;
              padding: 30px;
              margin-bottom: 20px;
          }

          .success h3 {
              color: #155724;
              margin-bottom: 15px;
              font-size: 1.5em;
          }

          .token-section {
              margin: 20px 0;
          }

          .token-item {
              margin-bottom: 20px;
          }

          .token-item label {
              display: block;
              font-weight: 600;
              color: #155724;
              margin-bottom: 8px;
          }

          .token-value {
              display: flex;
              align-items: center;
              gap: 10px;
          }

          .token-value code {
              flex: 1;
              background: #f8f9fa;
              padding: 10px;
              border-radius: 5px;
              font-family: 'Courier New', monospace;
              word-break: break-all;
              font-size: 0.9em;
          }

          .copy-btn {
              background: #28a745;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 0.8em;
              transition: background 0.3s ease;
          }

          .copy-btn:hover {
              background: #218838;
          }

          .instructions {
              margin-top: 25px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
          }

          .instructions h4 {
              color: #333;
              margin-bottom: 15px;
          }

          .instructions ol {
              margin-left: 20px;
              color: #555;
          }

          .instructions li {
              margin-bottom: 8px;
          }

          .error {
              background: #f8d7da;
              border: 1px solid #f5c6cb;
              border-radius: 10px;
              padding: 30px;
              margin-bottom: 20px;
              text-align: center;
          }

          .error h3 {
              color: #721c24;
              margin-bottom: 15px;
              font-size: 1.5em;
          }

          .error p {
              color: #721c24;
              margin-bottom: 20px;
          }

          .retry-btn {
              background: #dc3545;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 1em;
              transition: background 0.3s ease;
          }

          .retry-btn:hover {
              background: #c82333;
          }

          .actions {
              text-align: center;
              margin-top: 30px;
          }

          .home-btn {
              background: #007bff;
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 1em;
              transition: background 0.3s ease;
          }

          .home-btn:hover {
              background: #0056b3;
          }

          code {
              background: #f1f3f4;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
          }

          .toast {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 15px 20px;
              border-radius: 8px;
              color: white;
              font-weight: 600;
              z-index: 1000;
              animation: slideIn 0.3s ease-out;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .toast-success {
              background: linear-gradient(135deg, #28a745, #20c997);
          }

          .toast-error {
              background: linear-gradient(135deg, #dc3545, #e74c3c);
          }

          @keyframes slideIn {
              from {
                  transform: translateX(100%);
                  opacity: 0;
              }
              to {
                  transform: translateX(0);
                  opacity: 1;
              }
          }
      `}</style>
    </>
  );
}