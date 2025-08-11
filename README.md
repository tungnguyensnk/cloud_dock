# Cloud Dock 🚀

A modern, secure file storage and sharing application built with Next.js and Google Drive API. Cloud Dock provides a
clean, intuitive interface for uploading, managing, and sharing files through Google Drive with optional password
protection.

## 🌐 Live Demo

**[Try Cloud Dock Live](https://clouddock.kizunasoft.com/)**

Experience the full functionality of Cloud Dock with our hosted demo. Upload, manage, and share files seamlessly through
our live instance.

## ✨ Features

- **File Upload & Download**: Seamlessly upload files to Google Drive and download them with a single click
- **File Management**: View, organize, and delete files with an intuitive interface
- **Link Sharing**: Generate shareable links for any uploaded file
- **Password Protection**: Optional password-based access control for enhanced security
- **Auto-Delete**: Configurable automatic file deletion after specified time periods
- **Responsive Design**: Modern, mobile-friendly interface with smooth animations
- **Real-time Updates**: Live file list updates after upload/delete operations
- **Google Drive Integration**: Direct integration with Google Drive API for reliable storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, CSS-in-JS
- **Backend**: Next.js API Routes
- **Storage**: Google Drive API
- **Authentication**: Google OAuth 2.0
- **File Handling**: Multer for multipart form data
- **UI/UX**: Custom CSS with gradient designs and animations

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 16.x or higher
- npm or yarn package manager
- Google Cloud Console account
- Google Drive API enabled
- OAuth 2.0 credentials configured

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cloud_dock
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
PASSWORD=your_optional_app_password
AUTO_DELETE=1
```

### 4. Google Cloud Setup

1. **Create a Google Cloud Project**:
    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project or select an existing one

2. **Enable Google Drive API**:
    - Navigate to [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
    - Click "Enable"

3. **Create OAuth 2.0 Credentials**:
    - Go to [Credentials](https://console.cloud.google.com/apis/credentials)
    - Click "Create Credentials" → "OAuth client ID"
    - Choose "Web application"
    - Add authorized redirect URI: `http://localhost:3000/oauth2callback`
    - Save the Client ID and Client Secret

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Complete OAuth Setup

1. Navigate to the setup page: `http://localhost:3000/setup`
2. Enter your Google OAuth Client ID and Client Secret
3. Complete the authentication flow
4. Update your `.env.local` file with the refresh token
5. Restart the application

## 📁 Project Structure

```
cloud_dock/
├── components/
│   └── PasswordProtection.js    # Password protection component
├── config/
│   └── google-config.json       # Google API configuration
├── lib/
│   ├── autoDeleteService.js     # Auto-delete functionality
│   └── googleDrive.js           # Google Drive API service
├── pages/
│   ├── api/                     # API routes
│   │   ├── auto-delete.js       # Auto-delete API
│   │   ├── check-password.js    # Password validation
│   │   ├── delete.js            # File deletion
│   │   ├── files.js             # File listing
│   │   ├── oauth-callback.js    # OAuth callback handler
│   │   ├── setup-oauth.js       # OAuth setup
│   │   ├── upload.js            # File upload
│   │   └── verify-password.js   # Password verification
│   ├── _app.js                  # App configuration
│   ├── index.js                 # Main application page
│   ├── oauth2callback.js        # OAuth callback page
│   └── setup.js                 # Setup page
├── .gitignore
├── next.config.js               # Next.js configuration
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable               | Description                                        | Required | Default |
|------------------------|----------------------------------------------------|----------|---------|
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID                             | Yes      | -       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret                         | Yes      | -       |
| `GOOGLE_REDIRECT_URI`  | OAuth redirect URI                                 | Yes      | -       |
| `GOOGLE_REFRESH_TOKEN` | Google OAuth refresh token                         | Yes      | -       |
| `PASSWORD`             | Application password for access control            | No       | -       |
| `AUTO_DELETE`          | Enable auto-delete feature (1=enabled, 0=disabled) | No       | 0       |

### Auto-Delete Configuration

The auto-delete feature helps manage storage space by automatically removing files after a specified time period.

- Set `AUTO_DELETE=1` in your `.env` file to enable the feature
- Set `AUTO_DELETE=0` or omit the variable to disable auto-delete
- Configure deletion schedules through the application interface
- Files are checked and deleted based on their upload timestamp

## 🔒 Security Features

- **OAuth 2.0 Authentication**: Secure Google Drive access
- **Password Protection**: Optional app-level password protection
- **Environment Variables**: Sensitive data stored in environment variables
- **CORS Protection**: API routes protected against unauthorized access
- **Input Validation**: File upload validation and sanitization

## 📱 API Endpoints

| Endpoint               | Method | Description              |
|------------------------|--------|--------------------------|
| `/api/files`           | GET    | List all files           |
| `/api/upload`          | POST   | Upload a file            |
| `/api/delete`          | DELETE | Delete a file            |
| `/api/file/[id]`       | GET    | Download a file          |
| `/api/setup-oauth`     | POST   | Setup OAuth credentials  |
| `/api/oauth-callback`  | POST   | Handle OAuth callback    |
| `/api/verify-password` | POST   | Verify app password      |
| `/api/auto-delete`     | GET    | Get auto-delete settings |

## 🎨 UI/UX Features

- **Modern Design**: Clean, gradient-based design with smooth animations
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Visual feedback during file operations
- **File Type Icons**: Visual file type identification
- **Drag & Drop**: Intuitive file selection (planned feature)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Update redirect URI to your production domain
5. Deploy

### Other Platforms

The application can be deployed on any platform that supports Next.js:

- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Error**: Ensure redirect URI matches exactly in Google Cloud Console
2. **File Upload Fails**: Check Google Drive API quotas and permissions
3. **Password Protection Not Working**: Verify `PASSWORD` environment variable
4. **Files Not Loading**: Check Google Drive API credentials and refresh token

### Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Google Drive API is enabled and configured properly
4. Check the application logs for detailed error information

## 🔄 Changelog

### v1.0.0

- Initial release
- File upload/download functionality
- Google Drive integration
- Password protection
- Auto-delete feature
- Responsive UI design

---

**Built with ❤️ using Next.js and Google Drive API**