import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Guide() {
  const [activeTab, setActiveTab] = useState('api');

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/files',
      description: 'get list of uploaded files',
      params: 'pageSize (optional): number of files to return (default: 10)\npassword (optional): authentication password if PASSWORD env is set',
      response: `{
  "success": true,
  "data": [
    {
      "id": "file_id",
      "name": "filename.ext",
      "size": 1024,
      "createdTime": "2024-01-01T00:00:00.000Z"
    }
  ]
}`
    },
    {
      method: 'POST',
      endpoint: '/api/upload',
      description: 'upload file to Google Drive',
      params: 'file: multipart file data\npassword (optional): authentication password if PASSWORD env is set',
      response: `{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "file_id",
    "name": "filename.ext",
    "autoDelete": null
  }
}`
    },
    {
      method: 'GET',
      endpoint: '/api/file/[fileId]',
      description: 'download file by ID',
      params: 'fileId: Google Drive file ID\nfilename (optional): custom filename for download',
      response: 'Binary file stream with appropriate headers'
    },
    {
      method: 'DELETE',
      endpoint: '/api/delete',
      description: 'delete file from Google Drive',
      params: 'fileId: Google Drive file ID\npassword (optional): authentication password if PASSWORD env is set',
      response: `{
  "success": true,
  "message": "File deleted successfully"
}`
    },
    {
      method: 'GET',
      endpoint: '/api/auto-delete',
      description: 'get auto-delete configuration',
      params: 'none',
      response: `{
  "success": true,
  "data": {
    "enabled": true,
    "delayMinutes": 60
  }
}`
    }
  ];

  const curlExamples = [
    {
      title: 'List Files',
      code: `curl -X GET "http://localhost:3000/api/files?pageSize=5&password=your_password"`
    },
    {
      title: 'Upload File',
      code: `curl -X POST "http://localhost:3000/api/upload" \\
  -F "file=@/path/to/your/file.txt" \\
  -F "password=your_password"`
    },
    {
      title: 'Download File',
      code: `curl -X GET "http://localhost:3000/api/file/FILE_ID?filename=myfile.txt" \\
  -o downloaded_file.txt`
    },
    {
      title: 'Delete File',
      code: `curl -X DELETE "http://localhost:3000/api/delete" \\
  -H "Content-Type: application/json" \\
  -d '{"fileId":"FILE_ID","password":"your_password"}'`
    }
  ];

  return (
    <>
      <Head>
        <title>API Documentation - Cloud Dock</title>
        <meta name="description" content="Complete guide and API documentation for Cloud Dock"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>

      <div className="page-wrapper guide">
        <div className="container">
          <div className="header">
            <h1>📖 API Documentation</h1>
            <p>Complete guide for using Cloud Dock and its API</p>
          </div>

          <div className="tabs">

            <button
              className={`tab ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              🔌 API Reference
            </button>
            <button
              className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              💡 Examples
            </button>
          </div>

          <div className="tab-content">


            {activeTab === 'api' && (
              <div className="section">
                <h2>🔌 API Reference</h2>
                <p>All API endpoints return JSON responses with the following structure:</p>
                <div className="code-block">
                  <pre>{`{
  "success": boolean,
  "message": "string",
  "data": object,
  "error": "string"
}`}</pre>
                </div>

                <div className="api-endpoints">
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="api-endpoint">
                      <div className="endpoint-header">
                        <span className={`method method-${endpoint.method.toLowerCase()}`}>
                          {endpoint.method}
                        </span>
                        <code className="endpoint-path">{endpoint.endpoint}</code>
                      </div>
                      <p className="endpoint-description">{endpoint.description}</p>

                      <div className="endpoint-details">
                        <h4>Parameters:</h4>
                        <div className="code-block">
                          <pre>{endpoint.params}</pre>
                        </div>

                        <h4>Response:</h4>
                        <div className="code-block">
                          <pre>{endpoint.response}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="error-codes">
                  <h3>📋 Common Error Codes</h3>
                  <ul>
                    <li><code>400</code> - Bad Request (missing parameters)</li>
                    <li><code>401</code> - Unauthorized (invalid password or missing Google auth)</li>
                    <li><code>405</code> - Method Not Allowed</li>
                    <li><code>500</code> - Internal Server Error</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="section">
                <h2>💡 cURL Examples</h2>
                <p>Here are practical examples of using the API with cURL:</p>

                {curlExamples.map((example, index) => (
                  <div key={index} className="example">
                    <h3>{example.title}</h3>
                    <div className="code-block">
                      <pre>{example.code}</pre>
                    </div>
                  </div>
                ))}

                <div className="example">
                  <h3>JavaScript Fetch Example</h3>
                  <div className="code-block">
                    <pre>{`// upload file
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('password', 'your_password');

fetch('/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));

// list files
fetch('/api/files?pageSize=10&password=your_password')
.then(response => response.json())
.then(data => console.log(data.data));

// delete file
fetch('/api/delete', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileId: 'your_file_id',
    password: 'your_password'
  })
})
.then(response => response.json())
.then(data => console.log(data));`}</pre>
                  </div>
                </div>

                <div className="tips">
                  <h3>💡 Tips & Best Practices</h3>
                  <ul>
                    <li>Always check the <code>success</code> field in API responses</li>
                    <li>Handle <code>needsSetup: true</code> errors by redirecting to setup page</li>
                    <li>Use appropriate Content-Type headers for different request types</li>
                    <li>Store file IDs for future operations (download, delete)</li>
                    <li>Implement proper error handling for network failures</li>
                    <li>Consider file size limits (5GB max)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div style={{textAlign: 'center', marginTop: '40px', marginBottom: '40px'}}>
            <Link href="/" className="back-home-link">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}