// .github/scripts/code-review.js
const { Octokit } = require("@octokit/rest");
const OpenAIApi = require("openai");

const octokit = new Octokit({ auth: process.env.PAT_TOKEN });
const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
const pullRequestNumber = process.env.GITHUB_REF.split('/').pop();

console.log(`Owner: ${owner}, Repo: ${repo}, Pull Request: ${pullRequestNumber}`);

// Function to get the changed files in the pull request
async function getChangedFiles() {
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner: owner,
    repo: repo,
    pull_number: pullRequestNumber,
  });
  console.log(files, 'files')
  return files.filter(file => file.filename.endsWith('.js') || file.filename.endsWith('.jsx') || file.filename.endsWith('.css'));
}

// Function to create the OpenAI prompt with coding standards
function createPrompt(code) {
  return `
  Please review the following code based on these coding standards:
  1. Use descriptive CSS className conventions, and avoid inline styling.
  2. Ensure there is an ID using the descriptive className with a unique identifier appended.
  3. Utilize React hooks and functional components instead of class components.
  4. Ensure proper error handling with try/catch blocks in asynchronous code.

  Here is the code to review:
  ${code}
  `;
}

// Function to send code to OpenAI for review
async function reviewCodeWithOpenAI(code) {
  const prompt = createPrompt(code);
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
  });
  return response.data.choices[0].message.content;
}

// Post feedback to the pull request as a comment
async function postFeedback(feedback) {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullRequestNumber,
    body: feedback,
  });
}

// Main function to run code review
(async () => {
  try {
    const changedFiles = await getChangedFiles();
    
    for (const file of changedFiles) {
      // Fetch file content and review it
      const feedback = await reviewCodeWithOpenAI(file.patch);
      
      // Post feedback as a comment in the pull request
      await postFeedback(`Code review for file ${file.filename}:\n${feedback}`);
    }
  } catch (error) {
    console.error("Error during code review:", error);
  }
})();
