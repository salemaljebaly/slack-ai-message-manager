# Slack AI Message Manager

A powerful client-side application that allows you to detect, analyze, and bulk manage Slack messages using AI. Built with Next.js 15 and runs entirely in the browser - no backend required!

```
slack-ai-message-manager/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Alert.tsx
│   │   ├── ApiConfiguration.tsx
│   │   ├── SearchForm.tsx
│   │   ├── MessageList.tsx
│   │   ├── Actions.tsx
│   │   └── SlackWarning.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── slack.ts     # Slack API integration
│   │   │   └── ai.ts        # AI providers integration
│   │   └── utils.ts         # Utility functions
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   └── constants/
│       └── index.ts         # App constants
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── .env.example
└── README.md

```

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

### Smart Message Detection

- **Custom AI Prompts**: Enter any prompt to find relevant messages (supports multiple languages)
- **AI-Powered Scoring**: Messages are scored by relevance (0-100%) using your chosen AI model
- **Multi-Model Support**: Works with OpenAI GPT-4/3.5, Google Gemini, and Anthropic Claude

### Simple Architecture

- **100% Client-Side**: No backend, database, or server infrastructure needed
- **Direct API Integration**: Makes calls directly to Slack and AI APIs from the browser
- **Secure**: API keys are never stored on any server

### Comprehensive Management

- **Advanced Search**: Filter by channel, user, date range, and custom prompts
- **Bulk Operations**: Select and delete multiple messages with confirmation
- **Export Options**: Download results as CSV or JSON for further analysis
- **Real-time Validation**: Instant feedback on API key validity

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: React hooks (useState, useContext)
- **Storage**: Browser localStorage for settings

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
2. **Slack API Token** with required scopes:

   - `search:read` - Search messages
   - `channels:history` - Read channel messages
   - `chat:write` - Delete messages
   - `channels:read` - List channels

3. **AI API Key** from one of:
   - OpenAI (GPT-4 or GPT-3.5)
   - Google (Gemini)
   - Anthropic (Claude)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/slack-ai-message-manager.git
cd slack-ai-message-manager
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `out` directory.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/slack-ai-message-manager)

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `out` directory to Netlify

### Self-Hosting

Since this is a static site, you can host it on any web server:

1. Build: `npm run build`
2. Upload the `out` directory to your web server
3. Configure your server to serve the static files

## 📖 Usage

### Initial Setup

1. **Configure API Keys**:

   - Enter your Slack token (bot or user token)
   - Select your AI provider and enter the API key
   - Click "Save Configuration"

2. **Validate Connections**:
   - The app will automatically validate your tokens
   - Green badges indicate valid tokens
   - Red badges indicate invalid tokens

### Searching Messages

1. **Enter Detection Prompt**:

   - Type your search criteria (e.g., "negative feedback", "urgent issues")
   - Supports any language

2. **Optional Filters**:

   - Channel: `#general`, `#support`
   - User: `@username`
   - Date range (if implemented)

3. **Run Search**:
   - Click "Search Messages"
   - Messages will be scored and sorted by relevance

### Managing Results

1. **Review Messages**:

   - Messages show relevance scores (0-100%)
   - Color-coded badges indicate relevance levels

2. **Select Messages**:

   - Click individual messages to select
   - Use "Select All" for bulk selection

3. **Export Data**:

   - **CSV**: Structured data for spreadsheets
   - **JSON**: Complete data with metadata

4. **Delete Messages**:
   - Select messages to delete
   - Confirm the action
   - Only your own messages can be deleted

## ⚠️ Important Limitations

### Slack API Limits

- **Rate Limits**: 1-100 requests per minute (varies by method)
- **Search Limit**: Maximum 100 messages per search
- **Delete Permissions**: Can only delete your own messages
- **Enterprise**: May have additional restrictions

### Browser Limitations

- Large datasets may impact performance
- CORS restrictions may apply to some Slack endpoints
- Memory limitations for processing many messages

### Cost Considerations

- AI API calls incur costs
- Monitor usage to manage expenses
- Implement batch processing for efficiency

## 🔒 Security

- **Client-Side Only**: No server-side data storage
- **Local Storage**: Optional, only for user preferences
- **API Keys**: Never transmitted to third parties
- **HTTPS**: All API calls use secure connections

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure TypeScript types are properly defined

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

- Create an issue for bug reports
- Start a discussion for feature requests
- Check existing issues before creating new ones

---

Made with ❤️ by [Your Name/Company]
