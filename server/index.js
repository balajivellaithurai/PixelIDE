import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

    // Extract human-readable output based on execution status
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

app.listen(PORT, () => {
  console.log(`🚀 PixelIDE Server listening on port ${PORT}`);
});
