import { useEffect, useState } from 'react';

export default function PasswordProtection({children}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [passwordRequired, setPasswordRequired] = useState(false);

  useEffect(() => {
    // check if password is required
    checkPasswordRequired();

    // check if already authenticated
    const savedAuth = localStorage.getItem('cloud_dock_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const checkPasswordRequired = async () => {
    try {
      const response = await fetch('/api/check-password');
      const data = await response.json();
      setPasswordRequired(data.required);
      if (!data.required) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking password requirement:', error);
      setPasswordRequired(false);
      setIsAuthenticated(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({password}),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('cloud_dock_auth', 'true');
        setIsAuthenticated(true);
      } else {
        setError('Incorrect password');
      }
    } catch (error) {
      setError('An error occurred, please try again');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳</div>
        <p>Loading...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .loading-spinner {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!passwordRequired || isAuthenticated) {
    return children;
  }

  return (
    <div className="password-container">
      <div className="password-form">
        <div className="password-header">
          <h1>🔒 Cloud Dock</h1>
          <p>Please enter password to access</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-input"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="submit-btn">
            🔓 Login
          </button>
        </form>
      </div>

      <style jsx>{`
        .password-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .password-form {
          background: white;
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 400px;
          width: 100%;
        }

        .password-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .password-header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .password-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .password-input {
          width: 100%;
          padding: 15px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .password-input:focus {
          outline: none;
          border-color: #4facfe;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          border: 1px solid #f5c6cb;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border: none;
          padding: 15px;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 172, 254, 0.3);
        }
      `}</style>
    </div>
  );
}