/**
 * PixelIDE Centralized Prompt System & Template Generators (Sprint 10)
 * Formats high-level prompts and system instructions taking structured AI Context objects.
 */

export const SYSTEM_INSTRUCTIONS = {
  CODE_EXPERT:
    "You are PixelIDE AI, a world-class senior software engineer and code reviewer built directly into PixelIDE. Provide precise, actionable, high-quality technical analysis formatted in clean GitHub-flavored Markdown. Use clean code blocks with syntax highlighting.",
  DEBUGGER:
    "You are PixelIDE AI Smart Debugger. Diagnose software bugs, compilation errors, runtime stack traces, and Judge0 output. Explain the root cause clearly and provide exact corrected code snippets.",
  TEACHER:
    "You are PixelIDE AI Mentor. Explain code concepts step-by-step in an intuitive, developer-friendly way suitable for engineers of all skill levels.",
  TEST_ENGINEER:
    "You are PixelIDE AI Test Engineer. Generate comprehensive, production-ready unit test suites using the idiomatic testing framework for the target language.",
  DOCUMENTER:
    "You are PixelIDE AI Technical Writer. Generate professional inline docstrings and module documentation.",
  INTERVIEW_INTERVIEWER:
    "You are PixelIDE AI Technical Interviewer. Act as an interviewer at a top tech company. Do NOT give full direct solution code immediately unless requested. Give constructive feedback, evaluate time/space complexity, hint at optimizations, and ask follow-up questions to test deep understanding.",
};

/**
 * Smart Debugger Prompt Generator
 */
export const debugPrompt = (context = {}) => {
  const {
    language = "javascript",
    filename = "file",
    sourceCode = "",
    compileOutput = "",
    stderr = "",
    stdout = "",
    consoleOutput = "",
    status = "",
    exitCode = null,
  } = context;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.DEBUGGER,
    prompt: `Analyze and debug the following ${language} code from file "${filename}":

### Source Code:
\`\`\`${language}
${sourceCode}
\`\`\`

### Execution Context & Diagnostic Outputs:
- **Judge0 Status:** ${status || "N/A"}
- **Exit Code:** ${exitCode !== null ? exitCode : "N/A"}
- **Compiler Errors:** ${compileOutput ? compileOutput : "None"}
- **Runtime Errors (stderr):** ${stderr ? stderr : "None"}
- **Standard Output (stdout):** ${stdout ? stdout : "None"}
- **Console Output / Logs:** ${consoleOutput ? consoleOutput : "None"}

Please evaluate this information and return your analysis strictly under the following markdown sections:

## Root Cause
[Describe the precise underlying bug or cause of failure]

## Explanation
[Explain why the error occurs in plain, accessible language]

## Affected Line
[Specify the exact line number(s) or function affected]

## Solution
[Step-by-step description of how to resolve the issue]

## Corrected Code
\`\`\`${language}
[Full working corrected source code]
\`\`\`

## Tips to Avoid It
[Best practice tips and recommendations to avoid similar bugs in the future]`,
  };
};

/**
 * Explain Code / Selection Prompt Generator
 */
export const explainPrompt = (context = {}) => {
  const {
    language = "javascript",
    filename = "file",
    sourceCode = "",
    selectedCode = "",
  } = context;

  const isSelection = Boolean(selectedCode && selectedCode.trim());
  const targetCode = isSelection ? selectedCode.trim() : sourceCode;
  const contextHeader = isSelection
    ? `The user highlighted a specific code snippet inside file "${filename}". Explain ONLY the highlighted block in detail, referencing full file context if needed.`
    : `The user requested an explanation for the entire file "${filename}".`;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.TEACHER,
    prompt: `${contextHeader}

${isSelection ? `### Full File Context:\n\`\`\`${language}\n${sourceCode}\n\`\`\`\n` : ""}
### ${isSelection ? "Highlighted Code Selection to Explain:" : "Source Code to Explain:"}
\`\`\`${language}
${targetCode}
\`\`\`

Requirements:
1. Provide an executive overview of what this ${isSelection ? "code block" : "file"} accomplishes.
2. Provide a line-by-line or step-by-step breakdown of core logic, functions, variables, and algorithms.
3. Highlight key data structures, state changes, or API calls.`,
  };
};

/**
 * AI Code Review Prompt Generator
 */
export const reviewPrompt = (context = {}) => {
  const { language = "javascript", filename = "file", sourceCode = "" } = context;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Perform a comprehensive, professional code review for the file "${filename}" written in ${language}:

\`\`\`${language}
${sourceCode}
\`\`\`

Evaluate the code thoroughly and structure your response with these exact markdown sections:

## Overall Score
[Assign a numerical score out of 10 with a brief summary statement]

## Strengths
- [Key positive aspects and good patterns]

## Weaknesses
- [Areas needing improvement or risk areas]

## Readability
[Assessment of variable naming, structure, formatting, and clarity]

## Performance
[Evaluation of time and space complexity and potential bottlenecks]

## Security
[Analysis of potential security risks or vulnerabilities]

## Maintainability
[Assessment of modularity, extensibility, and technical debt]

## Best Practices
[Adherence to ${language} idioms and industry standards]

## Suggested Improvements
\`\`\`${language}
[Refactored or improved version of the code implementing all recommendations]
\`\`\``,
  };
};

/**
 * Optimize Code Prompt Generator
 */
export const optimizePrompt = (context = {}) => {
  const { language = "javascript", filename = "file", sourceCode = "" } = context;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Optimize the following ${language} code from "${filename}" for maximum execution speed, memory efficiency, and structural elegance:

\`\`\`${language}
${sourceCode}
\`\`\`

Provide your response strictly structured under the following markdown headers:

## Performance Improvements
- [Detailed list of algorithmic or runtime optimizations]

## Cleaner Structure
- [Structural and architectural refactorings applied]

## Simplified Logic
- [Simplifications made to conditions, loops, or data flow]

## Optimized Code
\`\`\`${language}
[Complete optimized code implementation]
\`\`\`

## Why the changes help
[Clear explanation of the performance gains and Big-O improvements]`,
  };
};

/**
 * Generate Unit Tests Prompt Generator
 */
export const testsPrompt = (context = {}) => {
  const { language = "javascript", filename = "file", sourceCode = "" } = context;

  const testFrameworkMap = {
    javascript: "Jest / Vitest",
    python: "pytest",
    java: "JUnit 5",
    cpp: "GoogleTest (gtest)",
    c: "Unity Framework",
  };

  const framework = testFrameworkMap[language.toLowerCase()] || `${language} standard test framework`;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.TEST_ENGINEER,
    prompt: `Generate a comprehensive unit test suite for the following ${language} code from file "${filename}":

\`\`\`${language}
${sourceCode}
\`\`\`

Requirements:
1. Target Testing Framework: **${framework}**.
2. Cover happy paths, edge cases, null/invalid inputs, boundary values, and error conditions.
3. Organize test cases cleanly with descriptive titles and assertion comments.
4. Output ready-to-run test file code inside a code block.`,
  };
};

/**
 * Generate Technical Documentation Prompt Generator
 */
export const documentationPrompt = (context = {}) => {
  const { language = "javascript", filename = "file", sourceCode = "" } = context;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.DOCUMENTER,
    prompt: `Generate complete, professional technical documentation for the file "${filename}" (${language}):

\`\`\`${language}
${sourceCode}
\`\`\`

Please organize the documentation with the following sections:

## Function Summaries
[High-level overview of every function, class, or module in the file]

## Parameters
[Detailed table or list of parameters, types, and descriptions]

## Returns
[Return types and descriptions for all functions]

## Examples
\`\`\`${language}
[Working usage example demonstrating how to invoke the code]
\`\`\`

## Edge Cases
[List of edge cases, exceptions thrown, or boundary constraints to consider]`,
  };
};

/**
 * Technical Interview Prompt Generator
 */
export const interviewPrompt = (context = {}) => {
  const {
    language = "javascript",
    filename = "file",
    sourceCode = "",
    problemStatement = "Coding Challenge",
    userQuestion = "",
  } = context;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.INTERVIEW_INTERVIEWER,
    prompt: `Technical Interview Evaluation for file "${filename}":

### Problem Statement:
${problemStatement}

### Candidate's Solution (${language}):
\`\`\`${language}
${sourceCode}
\`\`\`

### Candidate Input / Question:
${userQuestion || "Please evaluate my solution and provide feedback."}

As an interviewer:
1. Evaluate code correctness and approach.
2. Analyze Time and Space Complexity (Big-O).
3. Identify potential bugs or edge cases.
4. Provide a constructive hint or follow-up question.`,
  };
};

/**
 * AI Refactor Prompt Generator (Feature 3)
 */
export const refactorPrompt = (context = {}) => {
  const { language = "javascript", filename = "file", sourceCode = "" } = context;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Perform an intelligent, production-grade code refactoring on file "${filename}" (${language}):

\`\`\`${language}
${sourceCode}
\`\`\`

Refactoring Requirements:
1. Preserve exact business functionality and semantics.
2. Improve readability, variable/function naming, and formatting.
3. Remove duplicate or dead code logic.
4. Enhance software architecture, modularity, and clean code practices.

Please output your response strictly under these exact headers:

## Original Code
\`\`\`${language}
${sourceCode}
\`\`\`

## Refactored Code
\`\`\`${language}
[Full refactored code implementation]
\`\`\`

## Explanation of Changes
- [Detailed bullet points explaining key refactoring decisions, naming improvements, and structural changes]`,
  };
};

/**
 * AI Bug Fix Prompt Generator (Feature 4)
 */
export const fixBugPrompt = (context = {}) => {
  const {
    language = "javascript",
    filename = "file",
    sourceCode = "",
    compileOutput = "",
    stderr = "",
    consoleOutput = "",
  } = context;

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.DEBUGGER,
    prompt: `Identify and fix all bugs in file "${filename}" (${language}):

### Source Code:
\`\`\`${language}
${sourceCode}
\`\`\`

### Execution Output & Diagnostics:
- **Compiler Errors:** ${compileOutput || "None"}
- **Runtime Errors:** ${stderr || "None"}
- **Console Output:** ${consoleOutput || "None"}

Please structure your response strictly under these exact headers:

## Identified Bug
[Clear description of the bug, syntax error, or logical flaw found]

## Why It Occurs
[Technical explanation of why the failure or unexpected behavior happens]

## Corrected Code
\`\`\`${language}
[Full corrected working source code]
\`\`\`

## Explanation of Fix
[Step-by-step summary of the fixes applied and how they prevent recurrence]`,
  };
};

/**
 * AI Commit Message Generator Prompt Generator (Feature 5)
 */
export const commitMessagePrompt = (context = {}) => {
  const { files = [], projectTree = "", recentlyEditedFiles = [] } = context;

  const filesSummary = files
    .map((f) => `- ${f.name} (${f.language}, ${f.contentLength} bytes)`)
    .join("\n");

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Analyze the current workspace state and generate professional Git commit messages:

### Workspace Project Files:
${filesSummary || projectTree}

### Recently Modified Files:
${recentlyEditedFiles.join(", ") || "Active file edits"}

Provide structured git commit messages under the following markdown headers:

## Conventional Commit
\`\`\`
[type]([scope]): [short imperative summary in lowercase]
\`\`\`
*(Example: feat(workspace): add multi-file state management)*

## Short Version
[Single concise sentence summarizing the main workspace change]

## Detailed Version
[Comprehensive multi-paragraph commit message body suitable for pull request descriptions]

## Bullet Summary
- [Bullet list of key changes across files]`,
  };
};

/**
 * Workspace Summary Prompt Generator (Feature 6)
 */
export const workspaceSummaryPrompt = (context = {}) => {
  const { files = [], projectTree = "", activeFile = null } = context;

  const filesContent = files
    .map((f) => `### File: ${f.name} (${f.language})\n\`\`\`${f.language}\n${f.content.slice(0, 1000)}\n\`\`\``)
    .join("\n\n");

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Generate an executive Workspace Summary for this IDE project:

### Active File: ${activeFile?.name || "None"}
### Project Tree:
${projectTree}

### Workspace Files Contents (Snippets):
${filesContent}

Please analyze the entire workspace and generate a structured project analysis under these exact headers:

## Technologies Used
- [Languages, libraries, framework paradigms detected]

## Folder Structure
\`\`\`
${projectTree}
\`\`\`

## Components
- [Key modules, components, and functions identified across files]

## State Management
[Analysis of state management, variables, and data flow]

## API Usage
[Network calls, Judge0 endpoints, or external APIs detected]

## AI Features
[Integrated AI tools, prompts, or intelligence capabilities]

## Suggestions
- [Actionable recommendations for architecture, performance, or refactoring]`,
  };
};

/**
 * AI Workspace Chat Prompt Generator (Feature 2)
 */
export const chatPrompt = (messages = [], context = {}) => {
  const {
    filename = "file",
    language = "javascript",
    sourceCode = "",
    selectedCode = "",
    projectTree = "",
    files = [],
  } = context;

  const recentConversation = messages
    .slice(-10)
    .map((m) => `${m.sender === "user" ? "User" : "AI Assistant"}: ${m.text}`)
    .join("\n\n");

  const filesOverview = files
    .map((f) => `- ${f.name} (${f.language})`)
    .join("\n");

  return {
    systemInstruction:
      "You are Pix AI, a world-class senior software engineer and AI assistant built directly into Pix IDE. You have full context of the user's workspace, active file, project tree, and selection. Answer questions accurately, concisely, and cleanly using Markdown formatting and syntax-highlighted code blocks.",
    prompt: `Workspace Context:
- Active File: ${filename} (${language})
- Workspace Files:\n${filesOverview}
- Project Structure:\n${projectTree}
${selectedCode ? `- Highlighted Selection:\n\`\`\`${language}\n${selectedCode}\n\`\`\`\n` : ""}
- Active File Code:\n\`\`\`${language}\n${sourceCode}\n\`\`\`

Conversation History:
${recentConversation}

Answer the user's request comprehensively based on the full workspace context provided.`,
  };
};
