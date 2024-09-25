// .github/scripts/review.js
const { Octokit } = require("@octokit/rest");
const { Configuration, OpenAIApi } = require("openai");
const fetch = require('node-fetch');
const fs = require('fs');

// Set up OpenAI and GitHub Clients
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
const pullRequestNumber = process.env.GITHUB_REF.split('/').pop();

// Fetch files modified in the PR
async function getModifiedFiles() {
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullRequestNumber,
  });

  return files.filter(file => file.filename.endsWith('.js') || file.filename.endsWith('.jsx')).map(file => file.patch);
}

// Send files to OpenAI for review
async function reviewCodeWithOpenAI(code) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant focused on reviewing React code based on organizational best practices." },
        { role: "user", content: `Review the following code and suggest improvements:\n${code}` }
      ],
      max_tokens: 500,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

// Post feedback to the pull request
async function postComment(feedback) {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullRequestNumber,
    body: feedback,
  });
}

(async () => {
  try {
    const files = await getModifiedFiles();

    // Review each file's code
    for (let code of files) {
      const feedback = await reviewCodeWithOpenAI(code);
      await postComment(`Code review for this patch:\n${feedback}`);
    }
  } catch (error) {
    console.error('Error during code review:', error);
  }
})();
