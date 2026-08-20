import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_DIR = process.env.WORKSPACE_ROOT || path.resolve(__dirname, '..');

async function runGit(args, cwd = WORKSPACE_DIR) {
  try {
    const { stdout, stderr } = await execFileAsync('git', args, { cwd, maxBuffer: 10 * 1024 * 1024 });
    return { stdout: stdout.trim(), stderr: stderr.trim(), error: null };
  } catch (err) {
    return {
      stdout: err.stdout ? String(err.stdout).trim() : '',
      stderr: err.stderr ? String(err.stderr).trim() : err.message,
      error: err,
    };
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Judge0 Standard Language ID Mapping
const JUDGE0_LANGUAGE_MAP = {
  javascript: 63, // JavaScript (Node.js 12.14.0)
  python: 71,     // Python (3.8.1)
  c: 50,          // C (GCC 9.2.0)
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
};

app.get('/', (req, res) => {
  res.json({ message: 'PixelIDE Server is running!', timestamp: new Date() });
});

/* ==========================================================================
   REAL GIT INTEGRATION ENDPOINTS (Sprint 12)
   ========================================================================== */

// Sync workspace files to disk so Git CLI sees exact editor content
app.post('/api/git/sync-files', async (req, res) => {
  const { files = [] } = req.body;
  try {
    for (const file of files) {
      if (!file.name || typeof file.content !== 'string') continue;
      // Prevent directory traversal
      const safeName = path.normalize(file.name).replace(/^(\.\.[\/\\])+/, '');
      const targetPath = path.join(WORKSPACE_DIR, safeName);
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true });
      }
      await fs.promises.writeFile(targetPath, file.content, 'utf-8');
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('[Git Sync Error]', err);
    return res.status(500).json({ error: 'Failed to sync files to workspace', details: err.message });
  }
});

// Check repository detection and current Git status
app.get('/api/git/status', async (req, res) => {
  try {
    const isRepoRes = await runGit(['rev-parse', '--is-inside-work-tree']);
    if (isRepoRes.error || isRepoRes.stdout !== 'true') {
      return res.json({
        isGitRepo: false,
        currentBranch: '',
        staged: [],
        unstaged: [],
      });
    }

    let currentBranch = 'main';
    const branchRes = await runGit(['branch', '--show-current']);
    if (branchRes.stdout) {
      currentBranch = branchRes.stdout;
    } else {
      const headRes = await runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
      if (headRes.stdout) currentBranch = headRes.stdout;
    }

    const statusRes = await runGit(['status', '--porcelain=v1']);
    const lines = statusRes.stdout ? statusRes.stdout.split('\n').filter(Boolean) : [];

    const staged = [];
    const unstaged = [];

    for (const line of lines) {
      if (line.length < 3) continue;
      const x = line[0];
      const y = line[1];
      let filePath = line.substring(2).trim();
      if (filePath.startsWith('"') && filePath.endsWith('"')) {
        filePath = filePath.slice(1, -1);
      }
      if (filePath.includes(' -> ')) {
        filePath = filePath.split(' -> ')[1];
      }

      const fileName = path.basename(filePath);
      const ext = path.extname(fileName).slice(1);

      if (['M', 'A', 'D', 'R', 'C'].includes(x)) {
        staged.push({
          id: filePath,
          name: fileName,
          path: filePath,
          status: x,
          language: ext || 'plaintext',
        });
      }

      if (['M', 'D', 'W'].includes(y) || (x === '?' && y === '?')) {
        const statusTag = (x === '?' && y === '?') ? 'U' : y;
        unstaged.push({
          id: filePath,
          name: fileName,
          path: filePath,
          status: statusTag,
          language: ext || 'plaintext',
        });
      }
    }

    return res.json({
      isGitRepo: true,
      currentBranch,
      staged,
      unstaged,
    });
  } catch (error) {
    console.error('[Error] Git status failed:', error);
    return res.status(500).json({ error: 'Failed to retrieve Git status', details: error.message });
  }
});

// Initialize Git Repository
app.post('/api/git/init', async (req, res) => {
  try {
    const initRes = await runGit(['init']);
    if (initRes.error) {
      return res.status(500).json({ error: 'Failed to initialize Git repository', details: initRes.stderr });
    }
    return res.json({ success: true, message: 'Git repository initialized successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Git init failed', details: error.message });
  }
});

// List local Git branches
app.get('/api/git/branches', async (req, res) => {
  try {
    const isRepoRes = await runGit(['rev-parse', '--is-inside-work-tree']);
    if (isRepoRes.error || isRepoRes.stdout !== 'true') {
      return res.json({ isGitRepo: false, currentBranch: '', branches: [] });
    }

    const branchRes = await runGit(['branch', '--list']);
    const lines = branchRes.stdout ? branchRes.stdout.split('\n') : [];
    let currentBranch = 'main';
    const branches = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('* ')) {
        const name = trimmed.replace('* ', '').trim();
        currentBranch = name;
        branches.push(name);
      } else {
        branches.push(trimmed);
      }
    });

    return res.json({ isGitRepo: true, currentBranch, branches });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to list branches', details: error.message });
  }
});

// Branch Management (create, switch, delete)
app.post('/api/git/branch', async (req, res) => {
  const { action, name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Branch name is required' });
  }
  const branchName = name.trim();

  try {
    if (action === 'create') {
      const resGit = await runGit(['checkout', '-b', branchName]);
      if (resGit.error) {
        return res.status(400).json({ error: resGit.stderr || `Failed to create branch "${branchName}"` });
      }
      return res.json({ success: true, message: `Created and switched to branch "${branchName}"` });
    } else if (action === 'switch') {
      const resGit = await runGit(['checkout', branchName]);
      if (resGit.error) {
        return res.status(400).json({ error: resGit.stderr || `Failed to switch to branch "${branchName}"` });
      }
      return res.json({ success: true, message: `Switched to branch "${branchName}"` });
    } else if (action === 'delete') {
      const activeRes = await runGit(['branch', '--show-current']);
      if (activeRes.stdout === branchName) {
        return res.status(400).json({ error: 'Cannot delete the active branch.' });
      }
      const resGit = await runGit(['branch', '-D', branchName]);
      if (resGit.error) {
        return res.status(400).json({ error: resGit.stderr || `Failed to delete branch "${branchName}"` });
      }
      return res.json({ success: true, message: `Deleted branch "${branchName}"` });
    } else {
      return res.status(400).json({ error: 'Invalid branch action' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Branch operation failed', details: error.message });
  }
});

// Stage files
app.post('/api/git/stage', async (req, res) => {
  const { filePath, all } = req.body;
  try {
    const args = all ? ['add', '-A'] : ['add', '--', filePath];
    const stageRes = await runGit(args);
    if (stageRes.error) {
      return res.status(400).json({ error: stageRes.stderr || 'Failed to stage changes' });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Stage failed', details: error.message });
  }
});

// Unstage files
app.post('/api/git/unstage', async (req, res) => {
  const { filePath, all } = req.body;
  try {
    const args = all ? ['restore', '--staged', '.'] : ['restore', '--staged', '--', filePath];
    let unstageRes = await runGit(args);
    if (unstageRes.error) {
      const resetArgs = all ? ['reset', 'HEAD'] : ['reset', 'HEAD', '--', filePath];
      unstageRes = await runGit(resetArgs);
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Unstage failed', details: error.message });
  }
});

// Commit staged changes
app.post('/api/git/commit', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Commit message cannot be empty.' });
  }

  try {
    const commitRes = await runGit(['commit', '-m', message.trim()]);
    if (commitRes.error) {
      return res.status(400).json({ error: commitRes.stderr || 'Git commit failed' });
    }
    return res.json({ success: true, message: 'Committed successfully', output: commitRes.stdout });
  } catch (error) {
    return res.status(500).json({ error: 'Commit failed', details: error.message });
  }
});

// Commit History
app.get('/api/git/history', async (req, res) => {
  try {
    const isRepoRes = await runGit(['rev-parse', '--is-inside-work-tree']);
    if (isRepoRes.error || isRepoRes.stdout !== 'true') {
      return res.json({ commits: [] });
    }

    const logRes = await runGit(['log', '-n', '30', '--pretty=format:COMMIT_START%n%H|%h|%s|%an <%ae>|%aI|%ar', '--name-status']);
    if (logRes.error || !logRes.stdout) {
      return res.json({ commits: [] });
    }

    const rawCommits = logRes.stdout.split('COMMIT_START\n').filter(Boolean);
    const commits = rawCommits.map((block) => {
      const lines = block.trim().split('\n');
      const header = lines[0] || '';
      const [hash, shortHash, message, author, date, relativeTime] = header.split('|');

      const files = [];
      for (let i = 1; i < lines.length; i++) {
        const fileLine = lines[i].trim();
        if (!fileLine) continue;
        const parts = fileLine.split(/\s+/);
        if (parts.length >= 2) {
          files.push({ status: parts[0], name: parts[parts.length - 1] });
        }
      }

      return {
        hash: hash || 'head',
        shortHash: shortHash || 'head',
        message: message || 'Commit',
        author: author || 'Developer',
        date: date || new Date().toISOString(),
        relativeTime: relativeTime || 'Recently',
        files,
      };
    });

    return res.json({ commits });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch commit history', details: error.message });
  }
});

// File Diff (Original HEAD vs Working Tree)
app.get('/api/git/diff', async (req, res) => {
  const { filePath } = req.query;
  if (!filePath) {
    return res.status(400).json({ error: 'filePath parameter is required' });
  }

  try {
    let originalContent = '';
    const showRes = await runGit(['show', `HEAD:${filePath}`]);
    if (!showRes.error) {
      originalContent = showRes.stdout;
    }

    let modifiedContent = '';
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      modifiedContent = await fs.promises.readFile(fullPath, 'utf-8');
    }

    return res.json({
      filePath,
      originalContent,
      modifiedContent,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get file diff', details: error.message });
  }
});

// Get Staged Diff for AI Commit Generator
app.get('/api/git/staged-diff', async (req, res) => {
  try {
    const diffRes = await runGit(['diff', '--staged']);
    let diff = diffRes.stdout;
    if (!diff) {
      const workDiffRes = await runGit(['diff']);
      diff = workDiffRes.stdout || 'No changes detected.';
    }
    return res.json({ diff });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get staged diff', details: error.message });
  }
});

/* ==========================================================================
   JUDGE0 CODE EXECUTION ENDPOINT
   ========================================================================== */

app.post('/api/execute', async (req, res) => {
  const { language, code, stdin = "" } = req.body;

  console.log(`\n--- [1] Incoming Execution Request ---`);
  console.log(`Language: "${language}"`);
  console.log(`Code length: ${code?.length || 0} chars`);

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const languageId = JUDGE0_LANGUAGE_MAP[language?.toLowerCase()];
  if (!languageId) {
    console.error(`[Error] Unsupported language: ${language}`);
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  const requestBody = {
    source_code: code,
    language_id: languageId,
    stdin: stdin,
  };

  console.log(`\n--- [2] Sending Request to Judge0 ---`);
  console.log(`Target Language ID: ${languageId} (${language})`);
  console.log(`Request Body:`, JSON.stringify(requestBody, null, 2));

  // Determine Judge0 Endpoint & Headers (RapidAPI or Open CE API)
  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.JUDGE0_API_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';

  let judge0Url = 'https://ce.judge0.com/submissions?wait=true&fields=*';
  let headers = {
    'Content-Type': 'application/json',
  };

  if (rapidApiKey) {
    judge0Url = `https://${rapidApiHost}/submissions?wait=true&fields=*`;
    headers['x-rapidapi-key'] = rapidApiKey;
    headers['x-rapidapi-host'] = rapidApiHost;
    console.log(`Using RapidAPI Judge0 at ${rapidApiHost}`);
  } else {
    console.log(`Using Open Judge0 CE API Endpoint (${judge0Url})`);
  }

  try {
    const response = await axios.post(judge0Url, requestBody, { headers });

    console.log(`\n--- [3] Judge0 API Response ---`);
    console.log(`Status Code: ${response.status}`);
    console.log(`Response Data:`, JSON.stringify(response.data, null, 2));

    const { stdout, stderr, compile_output, status, time, memory } = response.data;

    let output = '';
    if (stdout) {
      output += stdout;
    }
    if (stderr) {
      output += (output ? '\n[Standard Error]\n' : '') + stderr;
    }
    if (compile_output) {
      output += (output ? '\n[Compilation Error]\n' : '') + compile_output;
    }
    if (!output && status?.description) {
      output = `Status: ${status.description}`;
    }

    return res.json({
      output: output || 'Program finished with no output.',
      status: status?.description || 'Finished',
      time,
      memory,
      stdout,
      stderr,
      compile_output,
    });
  } catch (error) {
    console.error(`\n--- [Error] Judge0 Execution Failed ---`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`Message: ${error.message}`);
    }

    return res.status(500).json({
      error: 'Failed to execute code.',
      details: error.response?.data?.message || error.response?.data?.error || error.message,
    });
  }
});

// Gemini AI Proxy Endpoint (Sprint 9 - Secure Backend Proxy)
app.post('/api/ai/generate', async (req, res) => {
  const { prompt, systemInstruction, model = 'gemini-3.6-flash', temperature = 0.7, maxTokens = 4096 } = req.body;
  
  const rawApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    req.headers['x-gemini-api-key'];

  console.log(`\n--- [AI Request Audit] Incoming AI Request ---`);
  console.log(`[DEBUG] Model Requested: "${model}"`);
  console.log(`[DEBUG] Key Configured: ${rawApiKey ? `YES (Length: ${String(rawApiKey).trim().length})` : 'NO (Missing)'}`);

  if (!rawApiKey) {
    console.error('[AI Audit Error] Gemini API key is missing on the server.');
    return res.status(401).json({
      error: 'Gemini API key is not configured.',
      details: 'Please set GEMINI_API_KEY in server/.env or environment variables.',
    });
  }

  const apiKey = String(rawApiKey).replace(/^["']|["']$/g, '').trim();

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  if (systemInstruction && systemInstruction.trim()) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(`[DEBUG - Audit Logging] Gemini API Response HTTP Status: ${response.status}`);

    const candidate = response.data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn('[DEBUG - Audit Logging] Candidate content was empty.');
      return res.status(422).json({ error: 'Gemini API returned an empty response.' });
    }

    return res.json({ text: text.trim() });
  } catch (error) {
    console.error(`\n--- [Error] Gemini AI API Failed ---`);
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message || error.message || 'Unknown Gemini API error';

    console.error(`[DEBUG - Audit Logging] Failed HTTP Status: ${statusCode}`);
    console.error(`[DEBUG - Audit Logging] Error Details: ${message}`);

    return res.status(statusCode).json({
      error: 'Gemini API execution failed.',
      details: message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PixelIDE Server listening on port ${PORT}`);
});

