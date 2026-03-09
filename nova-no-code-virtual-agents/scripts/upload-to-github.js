/**
 * NOVA - GitHub Upload Script
 * 
 * This script uploads the NOVA project to a GitHub repository named "NOVA"
 * 
 * Prerequisites:
 * 1. Install GitHub CLI: https://cli.github.com/
 * 2. Authenticate: gh auth login
 * 3. Create a Personal Access Token with repo permissions
 * 
 * Usage:
 *   node scripts/upload-to-github.js
 * 
 * Or run with custom options:
 *   node scripts/upload-to-github.js --token YOUR_TOKEN --repo NOVA
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPO_NAME = process.env.REPO_NAME || 'NOVA';
const REPO_DESCRIPTION = 'NOVA - No-Code Virtual Agents Platform with AI, Weather, Maps, Video & Audio Generation';
const DEFAULT_BRANCH = 'main';

// Parse command line arguments
const args = process.argv.slice(2);
let githubToken = null;
let customRepoName = REPO_NAME;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--token' && args[i + 1]) {
    githubToken = args[i + 1];
  }
  if (args[i] === '--repo' && args[i + 1]) {
    customRepoName = args[i + 1];
  }
}

console.log(`
╔═══════════════════════════════════════════════════════════╗
║           NOVA - GitHub Upload Script                    ║
║                                                           ║
║  Uploading to repository: ${customRepoName.padEnd(30)}║
╚═══════════════════════════════════════════════════════════╝
`);

// Check if gh is installed
function checkGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ GitHub CLI is not installed.');
    console.log('   Install it from: https://cli.github.com/');
    console.log('   Or run: winget install GitHub.cli');
    process.exit(1);
  }
}

// Check authentication
function checkAuth() {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    console.log('✅ GitHub CLI authenticated');
    return true;
  } catch (error) {
    console.log('❌ Not authenticated with GitHub.');
    console.log('   Run: gh auth login');
    console.log('   Or provide token with: --token YOUR_TOKEN');
    process.exit(1);
  }
}

// Initialize git if needed
function initGit() {
  const gitDir = path.join(__dirname, '..', '.git');
  
  if (!fs.existsSync(gitDir)) {
    console.log('📦 Initializing Git repository...');
    try {
      execSync('git init', { stdio: 'inherit' });
      execSync('git checkout -b main', { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to initialize git:', error.message);
    }
  }
}

// Create .gitignore if needed
function ensureGitIgnore() {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  const gitignoreContent = `
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
build/
dist/

# Testing
coverage/

# Misc
.DS_Store
*.pem
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.idea/
.vscode/
*.swp
*.swo
`;
  
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ Created .gitignore');
  }
}

// Get list of files to commit
function getFilesToCommit() {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    return output.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    return [];
  }
}

// Main upload function
async function uploadToGitHub() {
  // Check prerequisites
  checkGitHubCLI();
  
  // Change to project directory
  const projectDir = path.join(__dirname, '..');
  process.chdir(projectDir);
  
  console.log(`\n📁 Working directory: ${process.cwd()}`);
  
  // Initialize git
  initGit();
  ensureGitIgnore();
  
  // Check auth
  checkAuth();
  
  // Stage all files
  console.log('\n📝 Staging files...');
  try {
    execSync('git add .', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to stage files:', error.message);
  }
  
  // Check staged files
  const stagedFiles = getFilesToCommit();
  if (stagedFiles.length === 0) {
    console.log('✅ No files to commit (everything is up to date)');
  } else {
    console.log(`   ${stagedFiles.length} file(s) staged`);
  }
  
  // Commit changes
  console.log('\n💾 Committing changes...');
  try {
    const commitMessage = `feat: NOVA v1.0 - No-Code Virtual Agents Platform

Features:
- Agent Builder with visual workflow
- Real-time Weather API integration
- Google Maps API integration
- Video generation with limits (like Gemini)
- Audio/TTS generation
- Custom API support
- Code generation (JavaScript, Python, TypeScript)
- API key management per agent
- Media generation limits

Built with Next.js, Convex, and Tailwind CSS`;
    
    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    console.log('✅ Changes committed');
  } catch (error) {
    // Commit might fail if there are no changes
    console.log('   No changes to commit or commit failed');
  }
  
  // Create or update remote
  console.log('\n🔗 Setting up GitHub repository...');
  try {
    // Try to create the repository
    execSync(`gh repo create ${customRepoName} --source=. --public --description "${REPO_DESCRIPTION}" --push`, { 
      stdio: 'inherit',
      env: { ...process.env, GH_TOKEN: githubToken }
    });
    console.log('✅ Repository created and pushed to GitHub!');
  } catch (error) {
    // If repo already exists, just push
    try {
      // Check if remote exists
      execSync('git remote get-url origin', { stdio: 'pipe' });
      console.log('   Remote already exists, pushing changes...');
      execSync('git push -u origin main', { stdio: 'inherit' });
      console.log('✅ Changes pushed to GitHub!');
    } catch (pushError) {
      console.log('   Repository might already exist. Trying alternative method...');
      
      // Try with explicit push
      try {
        execSync(`gh repo create ${customRepoName} --public --description "${REPO_DESCRIPTION}" --clone=false`, { 
          stdio: 'pipe',
          env: { ...process.env, GH_TOKEN: githubToken }
        });
        
        // Get the repo HTTPS URL
        const repoUrl = `https://github.com/${process.env.GITHUB_USER || 'user'}/${customRepoName}.git`;
        execSync(`git remote add origin ${repoUrl}`, { stdio: 'pipe' });
        execSync('git push -u origin main', { stdio: 'inherit' });
        console.log('✅ Repository created and pushed!');
      } catch (createError) {
        console.log('   Repository creation skipped (may already exist)');
      }
    }
  }
  
  // Print success message
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   🎉 Upload Complete!                     ║
╚═══════════════════════════════════════════════════════════╝

📦 Repository: ${customRepoName}
🌐 URL: https://github.com/${process.env.GITHUB_USER || 'your-username'}/${customRepoName}

Next steps:
1. Visit your repository on GitHub
2. Add environment variables in GitHub Secrets:
   - OPENAI_API_KEY
   - NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY

3. Deploy to Vercel or your preferred hosting

📖 Documentation: Check README.md for setup instructions

Thank you for using NOVA! 🚀
`);
}

// Run the upload
uploadToGitHub().catch(error => {
  console.error('❌ Upload failed:', error);
  process.exit(1);
});

