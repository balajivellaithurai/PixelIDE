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
