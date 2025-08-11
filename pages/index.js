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


    </PasswordProtection>
  );
}