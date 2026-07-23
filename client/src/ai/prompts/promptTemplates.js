/**
 * PixelIDE Centralized Prompt System & Template Generators
 * Formats high-level prompts and system instructions for AI features.
 */

export const SYSTEM_INSTRUCTIONS = {
  CODE_EXPERT:
    "You are PixelIDE AI, a world-class senior software engineer and code reviewer built directly into PixelIDE. Provide precise, actionable, high-quality technical analysis formatted in clean GitHub-flavored Markdown. Use clean code blocks with syntax highlighting.",
  DEBUGGER:
    "You are PixelIDE AI Debugger. Diagnose software bugs, compilation errors, and runtime stack traces. Explain the root cause clearly and provide exact corrected code snippets.",
  TEACHER:
    "You are PixelIDE AI Mentor. Explain code concepts step-by-step in an intuitive, developer-friendly way suitable for engineers of all skill levels.",
  INTERVIEW_INTERVIEWER:
    "You are PixelIDE AI Technical Interviewer. Act as an interviewer at a top tech company. Do NOT give full direct solution code immediately unless requested. Give constructive feedback, evaluate time/space complexity, hint at optimizations, and ask follow-up questions to test deep understanding.",
};

/**
 * AI Code Review Prompt Generator
 */
export const reviewPrompt = ({ code, language = "javascript" }) => {
  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Please perform a thorough code review for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Analyze the code for:
1. Potential bugs, edge cases, and logical errors
2. Performance, time/space complexity improvements
3. Best practices, readability, and code structure
4. Security vulnerabilities (if applicable)

Provide a summary, bulleted issues found, and improved refactored code blocks where appropriate.`,
  };
};

/**
 * AI Debugger Prompt Generator
 */
export const debugPrompt = ({ code, language = "javascript", errorOutput = "" }) => {
  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.DEBUGGER,
    prompt: `The following ${language} code produced an error during execution:

### Source Code:
\`\`\`${language}
${code}
\`\`\`

### Execution Error Output / Terminal Logs:
\`\`\`
${errorOutput || "No explicit console error logged, but code did not behave as expected."}
\`\`\`

Tasks:
1. Identify the exact line or logic causing the failure.
2. Explain the root cause of the error clearly.
3. Provide the full corrected ${language} code fix.`,
  };
};

/**
 * Explain Code / Selection Prompt Generator
 */
export const explainPrompt = ({ code, language = "javascript", selectedText = "" }) => {
  const targetCode = selectedText && selectedText.trim() ? selectedText : code;
  const contextBlock =
    selectedText && selectedText.trim()
      ? `\n### Full File Context:\n\`\`\`${language}\n${code}\n\`\`\`\n`
      : "";

  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.TEACHER,
    prompt: `Please explain the following ${language} code block in detail:

${contextBlock}
### Code to Explain:
\`\`\`${language}
${targetCode}
\`\`\`

Cover:
1. Overview of what this code does
2. Step-by-step breakdown of core logic and functions
3. Key variables, data structures, or algorithms utilized`,
  };
};

/**
 * Optimize Code Prompt Generator
 */
export const optimizePrompt = ({ code, language = "javascript" }) => {
  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Optimize the following ${language} code for maximum performance, efficiency, and clean structure:

\`\`\`${language}
${code}
\`\`\`

Please output:
1. Analysis of current Big-O time and space complexity
2. Key bottlenecks and optimization techniques applied
3. Optimized version of the code in \`\`\`${language}\`\`\` blocks
4. Expected performance improvements after optimization`,
  };
};

/**
 * Generate Unit Tests Prompt Generator
 */
export const testsPrompt = ({ code, language = "javascript" }) => {
  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Generate comprehensive unit test suites for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Requirements:
1. Cover standard edge cases, null/undefined inputs, and boundary conditions
2. Use standard test framework syntax appropriate for ${language} (e.g. Jest/Vitest for JS, unittest/pytest for Python, JUnit for Java, GoogleTest/catch2 for C++)
3. Include clear descriptions for each test case`,
  };
};

/**
 * Generate Documentation Prompt Generator
 */
export const documentationPrompt = ({ code, language = "javascript" }) => {
  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.CODE_EXPERT,
    prompt: `Generate comprehensive technical documentation for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
1. High-level module / component summary
2. JSDoc / Docstring inline comments for functions and parameters
3. API / Function signatures table detailing arguments and return types
4. Quick usage example`,
  };
};

/**
 * Interview Feedback Prompt Generator
 */
export const interviewPrompt = ({
  code,
  language = "javascript",
  problemStatement = "Coding Challenge",
  userQuestion = "",
}) => {
  return {
    systemInstruction: SYSTEM_INSTRUCTIONS.INTERVIEW_INTERVIEWER,
    prompt: `Technical Interview Evaluation:

### Problem Statement:
${problemStatement}

### Candidate's Current Code (${language}):
\`\`\`${language}
${code}
\`\`\`

### Candidate Input / Response:
${userQuestion || "Please evaluate my solution and provide feedback."}

As an interviewer:
1. Provide feedback on code correctness and approach.
2. Evaluate Time and Space complexity.
3. Highlight potential edge cases or bugs.
4. Give a guiding hint or follow-up question without writing out the complete code solution immediately.`,
  };
};
