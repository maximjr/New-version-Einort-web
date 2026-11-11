# Einort Solutions Enterprise Architecture

Enterprise-grade software engineering, AI automation, and custom web development.

## Local Development

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure Firebase Environment Variables (Mandatory for full features):
   Create a \`.env\` file in the root directory and copy the contents from \`.env.example\`.
   \`\`\`bash
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Vercel Deployment

This application is configured for seamless deployment to Vercel. 

### Critical Deployment Step: Environment Variables
The application will safely boot and render a public-facing site even if Firebase fails or is missing, gracefully degrading interactive modules (like the Client Portal and Admin Dashboard). However, for full functionality, you **must** configure Firebase environment variables in your Vercel Project Settings.

1. Go to your **Vercel Dashboard**.
2. Select the **Einort** project.
3. Navigate to **Settings > Environment Variables**.
4. Add the exact identical keys from your `.env.example` file.
5. Trigger a full deployment.

> **Security Note:** Never hardcode your API keys in the source repository. Always rely on Vercel Environment Variables.
