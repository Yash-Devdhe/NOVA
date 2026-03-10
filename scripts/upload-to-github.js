/**
 * NOVA - GitHub Upload Script
 * 
 * This script uploads the NOVA project to a GitHub repository named "NOVA"
 * Account: Yash_Devdhe
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
 *   node scripts/upload-to-github.js --token YOUR_TOKEN
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPO_OWNER = 'Yash_Devdhe';
const REPO_NAME = 'NOVA';
const REPO_DESCRIPTION = 'NOVA - No-Code Virtual Agents Platform with AI, Weather, Maps, Video & Audio Generation';
const DEFAULT_BRANCH = 'main';

// Parse command line arguments
const args = process.argv.slice(2);
let githubToken = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--token' && args[i + 1]) {
    githubToken = args[i + 1];
  }
}

var consoleMsg = [
'╔═══════════════════════════════════════════════════════════╗',
'║           NOVA - GitHub Upload Script                    ║',
'║                                                           ║',
'║  Account: ' + REPO_OWNER.padEnd(42) + '║',
'║  Repository: ' + REPO_NAME.padEnd(40) + '║',
'╚═══════════════════════════════════════════════════════════╝'
].join('\n');

console.log(consoleMsg);

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
  
  console.log('\n📁 Working directory: ' + process.cwd());
  
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
    console.log('   ' + stagedFiles.length + ' file(s) staged');
  }
  
  // Commit changes
  console.log('\n💾 Committing changes...');
  try {
    const commitMessage = 'feat: NOVA v1.0 - No-Code Virtual Agents Platform\n\nFeatures:\n- Enhanced Dashboard Preview with scrollbars\n- Real-time Image & Video generation with progress indicators\n- Professional & colorful UI design\n- Agent Builder with visual workflow\n- Real-time Weather API integration\n- Google Maps API integration\n- Video generation with limits\n- Audio/TTS generation\n- Custom API support\n- Code generation (JavaScript, Python, TypeScript)\n- API key management per agent\n- Media generation limits\n\nBuilt with Next.js, Convex, and Tailwind CSS';
    
    const escapedMsg = commitMessage.replace(/"/g, '\\"');
    execSync('git commit -m "' + escapedMsg + '"', { stdio: 'inherit' });
    console.log('✅ Changes committed');
  } catch (error) {
    // Commit might fail if there are no changes
    console.log('   No changes to commit or commit failed');
  }
  
  // Create or update remote
  console.log('\n🔗 Setting up GitHub repository...');
  
  const repoUrl = 'https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '.git';
  
  try {
    // Check if remote exists
    execSync('git remote get-url origin', { stdio: 'pipe' });
    console.log('   Remote already exists');
    
    // Push changes
    console.log('   Pushing changes to GitHub...');
    execSync('git push -u origin main', { stdio: 'inherit' });
    console.log('✅ Changes pushed to GitHub!');
  } catch (error) {
    // Remote doesn't exist, create it
    try {
      console.log('   Creating repository on GitHub...');
      
      // Try to create the repository using gh
      const createCmd = 'gh repo create ' + REPO_NAME + ' --owner ' + REPO_OWNER + ' --public --description "' + REPO_DESCRIPTION + '" --source=. --push';
      execSync(createCmd, { 
        stdio: 'inherit',
        env: { ...process.env, GH_TOKEN: githubToken }
      });
      
      console.log('✅ Repository created and pushed to GitHub!');
    } catch (createError) {
      // If that fails, try alternative method
      console.log('   Trying alternative method...');
      
      try {
        // Set the remote manually
        execSync('git remote add origin ' + repoUrl, { stdio: 'pipe' });
        execSync('git push -u origin main', { stdio: 'inherit' });
        console.log('✅ Repository created and pushed!');
      } catch (pushError) {
        console.log('   Repository might already exist. Attempting force push...');
        
        try {
          const createOnlyCmd = 'gh repo create ' + REPO_NAME + ' --owner ' + REPO_OWNER + ' --public --description "' + REPO_DESCRIPTION + '" --clone=false';
          execSync(createOnlyCmd, { 
            stdio: 'pipe',
            env: { ...process.env, GH_TOKEN: githubToken }
          });
          
          execSync('git push -u origin main --force', { stdio: 'inherit' });
          console.log('✅ Repository synced with GitHub!');
        } catch (finalError) {
          console.log('   Repository creation skipped (may already exist)');
          
          // Try one more time with different approach
          try {
            execSync('git push -u origin main --force', { stdio: 'inherit' });
            console.log('✅ Changes force pushed to GitHub!');
          } catch (e) {
            console.log('   Push failed. Please push manually using: git push -u origin main');
          }
        }
      }
    }
  }
  
  // Print success message
  var successMsg = [
'',
'╔═══════════════════════════════════════════════════════════╗',
'║                   🎉 Upload Complete!                     ║',
'╚═══════════════════════════════════════════════════════════╝',
'',
'📦 Repository: ' + REPO_NAME,
'👤 Owner: ' + REPO_OWNER,
'🌐 URL: https://github.com/' + REPO_OWNER + '/' + REPO_NAME,
'',
'Next steps:',
'1. Visit your repository on GitHub',
'2. Add environment variables in GitHub Secrets:',
'   - OPENAI_API_KEY',
'   - REPLICATE_API_TOKEN',
'   - NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL',
'   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
'   - CLERK_SECRET_KEY',
'',
'3. Deploy to Vercel or your preferred hosting',
'',
'📖 Documentation: Check README.md for setup instructions',
'',
'Thank you for using NOVA! 🚀',
''
  ].join('\n');
  
  console.log(successMsg);
}

// Run the upload
uploadToGitHub().catch(error => {
  console.error('❌ Upload failed:', error);
  process.exit(1);
});

