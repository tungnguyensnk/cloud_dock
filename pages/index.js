import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PasswordProtection from '../components/PasswordProtection';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({show: false, message: '', type: ''});
  const [autoDeleteInfo, setAutoDeleteInfo] = useState(null);

  // load files on component mount
  useEffect(() => {
    loadFiles();
    loadAutoDeleteInfo();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (data.success) {
        setFiles(data.data);
      } else {
        // handle API errors
        if (data.needsSetup) {
          showToast('Google Drive API not configured. Please setup credentials first.', 'error');
        } else {
          showToast('Failed to load files: ' + data.error, 'error');
        }
        setFiles([]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      showToast('Network error: Unable to connect to server', 'error');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAutoDeleteInfo = async () => {
    try {
      const response = await fetch('/api/auto-delete');
      const data = await response.json();
      if (data.success) {
        setAutoDeleteInfo(data.data);
      }
    } catch (error) {
      console.error('Error loading auto delete info:', error);
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const showToast = (message, type = 'success') => {
    setToast({show: true, message, type});
    setTimeout(() => {
      setToast({show: false, message: '', type: ''});
    }, 3000);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        showToast('Upload successful!', 'success');
        setSelectedFile(null);
        // reset file input
        document.getElementById('fileInput').value = '';
        // reload files list
        loadFiles();
        // reload auto delete info
        loadAutoDeleteInfo();
      } else {
        // handle API errors
        if (data.needsSetup) {
          showToast('Google Drive API not configured. Please setup credentials first.', 'error');
        } else {
          showToast('Upload failed: ' + data.error, 'error');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId, fileName) => {
    const downloadUrl = `/api/file/${fileId}?filename=${encodeURIComponent(fileName)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloading file...', 'info');
  };

  const handleCopyLink = (fileId, fileName) => {
    const shareUrl = `${window.location.origin}/api/file/${fileId}?filename=${encodeURIComponent(fileName)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Unable to copy link', 'error');
    });
  };

  const handleDelete = async (fileId, fileName) => {
    if (!confirm(`Are you sure you want to delete file "${fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fileId})
      });

      const data = await response.json();
      if (data.success) {
        showToast('File deleted successfully!', 'success');
        loadFiles(); // reload files list
      } else {
        // handle API errors
        if (data.needsSetup) {
          showToast('Google Drive API not configured. Please setup credentials first.', 'error');
        } else {
          showToast('Failed to delete file: ' + data.error, 'error');
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete file: ' + error.message, 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US');
  };

  return (
    <PasswordProtection>
      <Head>
        <title>Cloud Dock - File Storage</title>
        <meta name="description" content="File upload and download with Google Drive"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>

      <div className="container">
        <div className="header">
          <h1>☁️ Cloud Dock</h1>
          <p>Store and share files with Google Drive</p>
          <div className="nav-links">
            <Link href="/setup" className="setup-link">
              🔧 Setup Google Drive API
            </Link>
          </div>
        </div>

        <div className="content">
          {/* Upload Section */}
          <div className="upload-section">
            <div className="upload-form">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="fileInput"
                  className="file-input"
                  onChange={handleFileSelect}
                />
                <label htmlFor="fileInput" className="file-input-label">
                  📁 Choose File
                </label>
              </div>

              {selectedFile && (
                <div className="selected-file">
                  📄 Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}

              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? '⏳ Uploading...' : '⬆️ Upload'}
              </button>
            </div>
          </div>

          {/* Auto Delete Info Section */}
          {autoDeleteInfo && (
            <div className="auto-delete-simple">
              <span className="auto-delete-text">
                ⏰ Auto delete files:
                <span className={`status ${autoDeleteInfo.enabled ? 'enabled' : 'disabled'}`}>
                  {autoDeleteInfo.enabled ? ` Enabled (${autoDeleteInfo.delayMinutes} minutes)` : ' Disabled'}
                </span>
              </span>
            </div>
          )}

          {/* Files Section */}
          <div className="files-section">
            <h2>📂 Files List</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <table className="files-table">
                <thead>
                <tr>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>{formatDate(file.createdTime)}</td>
                    <td className="actions-cell">
                      <button
                        className="download-btn"
                        onClick={() => handleDownload(file.id, file.name)}
                      >
                        ⬇️ Download
                      </button>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopyLink(file.id, file.name)}
                      >
                        🔗 Link
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(file.id, file.name)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            )}

            {!loading && files.length === 0 && (
              <div className="no-files">No files uploaded yet</div>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>

      <style jsx>{`
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }

          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
          }

          .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              overflow: hidden;
          }

          .header {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              padding: 30px;
              text-align: center;
          }

          .header h1 {
              font-size: 2.5rem;
              margin-bottom: 10px;
          }

          .header p {
              font-size: 1.1rem;
              opacity: 0.9;
              margin-bottom: 15px;
          }

          .nav-links {
              margin-top: 15px;
          }

          .setup-link {
              display: inline-block;
              background: linear-gradient(135deg, #28a745, #20c997);
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 25px;
              font-weight: 600;
              font-size: 0.9em;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
          }

          .setup-link:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
              text-decoration: none;
              color: white;
          }

          .content {
              padding: 40px;
          }

          .upload-section {
              background: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
              margin-bottom: 40px;
              border: 2px dashed #dee2e6;
              transition: all 0.3s ease;
          }

          .upload-section:hover {
              border-color: #4facfe;
              background: #f0f8ff;
          }

          .auto-delete-simple {
              text-align: center;
              margin-bottom: 20px;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 5px;
              border-left: 4px solid #ffc107;
          }

          .auto-delete-text {
              font-size: 0.9rem;
              color: #495057;
          }

          .status.enabled {
              color: #28a745;
              font-weight: 600;
          }

          .status.disabled {
              color: #dc3545;
              font-weight: 600;
          }

          .upload-form {
              text-align: center;
          }

          .file-input-wrapper {
              position: relative;
              display: inline-block;
              margin-bottom: 20px;
          }

          .file-input {
              position: absolute;
              opacity: 0;
              width: 100%;
              height: 100%;
              cursor: pointer;
          }

          .file-input-label {
              display: inline-block;
              padding: 15px 30px;
              background: #4facfe;
              color: white;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 1.1rem;
          }

          .file-input-label:hover {
              background: #3a8bfd;
              transform: translateY(-2px);
          }

          .upload-btn {
              background: #28a745;
              color: white;
              border: none;
              padding: 15px 40px;
              border-radius: 8px;
              font-size: 1.1rem;
              cursor: pointer;
              transition: all 0.3s ease;
              margin-left: 15px;
          }

          .upload-btn:hover {
              background: #218838;
              transform: translateY(-2px);
          }

          .upload-btn:disabled {
              background: #6c757d;
              cursor: not-allowed;
              transform: none;
          }

          .selected-file {
              margin: 15px 0;
              padding: 10px;
              background: #e9ecef;
              border-radius: 5px;
              font-style: italic;
          }

          .files-section h2 {
              color: #333;
              margin-bottom: 20px;
              font-size: 1.8rem;
          }

          .files-table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }

          .files-table th {
              background: #4facfe;
              color: white;
              padding: 15px;
              text-align: left;
              font-weight: 600;
          }

          .files-table td {
              padding: 15px;
              border-bottom: 1px solid #dee2e6;
          }

          .actions-cell {
              white-space: nowrap;
          }

          .files-table tr:hover {
              background: #f8f9fa;
          }

          .download-btn {
              background: #17a2b8;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 0.9rem;
              transition: all 0.3s ease;
              margin-right: 8px;
          }

          .download-btn:hover {
              background: #138496;
              transform: translateY(-1px);
          }

          .copy-btn {
              background: #ffc107;
              color: #212529;
              border: none;
              padding: 8px 16px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 0.9rem;
              transition: all 0.3s ease;
              margin: 0 4px;
          }

          .copy-btn:hover {
              background: #e0a800;
              transform: translateY(-1px);
          }

          .delete-btn {
              background: #dc3545;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 0.9rem;
              transition: all 0.3s ease;
              margin: 0 4px;
          }

          .delete-btn:hover {
              background: #c82333;
              transform: translateY(-1px);
          }

          .loading {
              text-align: center;
              padding: 40px;
              color: #666;
              font-size: 1.1rem;
          }

          .no-files {
              text-align: center;
              padding: 40px;
              color: #666;
              font-style: italic;
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

          .toast-info {
              background: linear-gradient(135deg, #17a2b8, #20c997);
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
    </PasswordProtection>
  );
}