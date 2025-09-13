## MyACCOBot

### Introduction
MyACCOBot is a modern, full-stack application designed to streamline accounting and financial operations. It features a FastAPI backend and a React-based frontend, providing a seamless experience for both developers and end-users.

---

## Index
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Running Server and UI Together](#running-server-and-ui-together)

---

## Prerequisites

You will need the following tools installed on your system:

- Python 3.9+
- Node.js (v18+ recommended)
- npm (Node Package Manager)

---

## Server Setup (FastAPI Backend)

The `Server` folder contains the FastAPI backend for MyACCOBot. To run the backend server separately:

1. **Navigate to the Server folder:**
  ```sh
  cd Server
  ```

2. **(Optional but recommended) Create and activate a virtual environment:**
  ```sh
  python3 -m venv .venv
  source .venv/bin/activate
  ```

3. **Install `uv` (a fast Python package installer and runner):**
  ```sh
  pip install uv
  ```

4. **Install all required Python packages:**
  ```sh
  uv pip install -r requirements.txt
  ```

5. **Run the FastAPI server:**
  ```sh
  python main.py
  ```

---

## Running Server and UI Together

To run both the backend server and the frontend UI at the same time:

1. **Install npm dependencies (if not already done):**
  ```sh
  npm install
  ```

2. **Start both the server and UI concurrently:**
  ```sh
  npm run dev
  ```

This will launch both the FastAPI backend and the React frontend for development.
- Professional finance/accounting themed conversations

### 📁 Advanced File System Integration
- Secure folder selection and XML file discovery
- Real-time XML validation and metadata extraction
- Support for multiple financial document types:
  - Income Statements
  - Balance Sheets  
  - Expense Reports
  - General Financial Documents

### 🎨 Professional UI/UX
- Curved interface design (no sharp edges)
- Finance-themed color scheme with blue/green palette
- Light/dark theme toggle functionality
- Responsive design with professional styling
- User messages: 50% width with background (right-aligned)
- Bot responses: Full width without background (left-aligned)

### 🔒 Security Features
- Restricted file system access (./test-data directory only)
- Input validation with Zod schemas
- CORS protection with origin allowlisting
- Secure request handling and error management

## Technical Stack

### Frontend
- **React** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - High-quality component library
- **TanStack Query** - Data fetching and caching
- **Wouter** - Lightweight routing
- **React Hook Form** - Form handling with validation

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe server development
- **Zod** - Schema validation
- **fast-xml-parser** - XML processing and validation
- **CORS** - Cross-origin resource sharing

### Additional Tools
- **ESBuild** - Fast bundling
- **PostCSS** - CSS processing
- **Drizzle ORM** - Database operations
- **Lucide React** - Icon library

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd myaccbot
npm install
```

### 2. Environment Setup
The application uses environment variables for configuration. Make sure you have:
```bash
SESSION_SECRET=your-session-secret
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage Guide

### Getting Started
1. **Launch the Application**: Open your browser to `http://localhost:5000`
2. **File Selection**: Click the "+" button to access file options
3. **Browse Files**: Select "Browse Files" to analyze XML financial documents
4. **Chat Interaction**: Type messages to interact with MYACCBOT

### File Analysis Workflow
1. **Folder Selection**: Choose a folder containing XML financial documents
2. **Automatic Validation**: The system validates all XML files and extracts metadata
3. **Analysis Report**: View detailed file analysis including:
   - Valid vs invalid file counts
   - Document types (income statements, balance sheets, etc.)
   - Company names and reporting periods
   - File sizes and modification dates
   - Validation errors for problematic files

### Chat Features
- **Real-time Messaging**: Send messages and receive immediate responses
- **Financial Context**: MYACCBOT understands financial terminology and concepts
- **File Integration**: Ask questions about analyzed financial documents
- **Message History**: Previous conversations are preserved during the session

## Project Structure

```
myaccbot/
├── client/src/                 # Frontend application
│   ├── components/            # React components
│   │   ├── ChatPage.tsx      # Main chat interface
│   │   ├── ChatInput.tsx     # Message input component
│   │   ├── ChatMessage.tsx   # Individual message display
│   │   ├── Header.tsx        # Application header
│   │   └── DropdownMenu.tsx  # File selection menu
│   ├── services/             # API services
│   ├── utils/                # Utility functions
│   └── pages/                # Page components
├── server/                   # Backend application
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Data storage layer
│   ├── index.ts             # Server entry point
│   └── vite.ts              # Development server setup
├── shared/                   # Shared types and schemas
│   └── schema.ts            # Zod validation schemas
├── test-data/               # Sample XML files for testing
│   ├── income_statement.xml
│   ├── balance_sheet.xml
│   ├── expenses.xml
│   └── sample.xml
└── package.json
```

## API Documentation

### File Handling Endpoints

#### POST /api/path
Process folder path and analyze XML files.

**Request:**
```json
{
  "path": "./test-data"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Folder path accepted. Found 4 XML files (3 valid, 1 invalid).",
  "folderPath": "./test-data",
  "xmlFilesCount": 4,
  "validFilesCount": 3,
  "invalidFilesCount": 1,
  "files": [
    {
      "fileName": "income_statement.xml",
      "isValid": true,
      "documentType": "financial_statement",
      "period": "2024-Q1",
      "company": "ACME Corporation"
    }
  ]
}
```

### Chat Endpoints

#### POST /api/chat
Send a chat message to MYACCBOT.

**Request:**
```json
{
  "message": "What financial data did you analyze?"
}
```

**Response:**
```json
{
  "success": true,
  "userMessage": { /* user message object */ },
  "botResponse": { /* bot response object */ }
}
```

#### GET /api/chat/history
Retrieve chat message history.

#### GET /api/folder
Get current folder information and file analysis.

## Development

### Running Tests
The application includes end-to-end testing capabilities:
```bash
# Run development server
npm run dev

# Testing is integrated with the development workflow
```

### Development Guidelines
- Follow TypeScript best practices
- Use Zod schemas for all data validation
- Implement proper error handling
- Follow the established component structure
- Use the provided UI component library

### Security Considerations
- File access is restricted to the `./test-data` directory
- All user inputs are validated with Zod schemas
- CORS is properly configured for development and production
- API endpoints include comprehensive error handling

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the frontend and backend are running on the correct ports
2. **File Access Denied**: Check that file paths are within the allowed `./test-data` directory
3. **XML Parsing Errors**: Verify XML files are well-formed and valid
4. **Port Conflicts**: Default port is 5000; ensure it's available

### Logs and Debugging
- Server logs are available in the console output
- Browser console shows frontend debugging information
- Use the network tab to inspect API requests and responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Test your changes thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

---

**MYACCBOT** - Your Intelligent Financial Assistant