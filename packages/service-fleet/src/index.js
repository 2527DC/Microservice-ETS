import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
const PORT = process.env.PORT || 4001;

// Path to your post content file
const POST_FILE = path.join(process.cwd(), "linkdin.md");

// 🔹 Home route: Redirect user to LinkedIn OAuth
app.get("/", (req, res) => {
  const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid%20profile%20email%20w_member_social`;

  res.send(`
    <h2>LinkedIn Auto-Post</h2>
    <p><a href="${authURL}">Login with LinkedIn to post file content automatically</a></p>
  `);
});

// 🔹 OAuth callback route - POSTS CONTENT FROM FILE
app.get("/linkedin/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send("❌ No code provided");

  try {
    // Read content from file
    let postContent = fs.readFileSync(POST_FILE, "utf-8");
    const timestamp = new Date().toLocaleString();
    postContent += `\n\n(Posted at: ${timestamp})`;

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI.split("?")[0],
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get LinkedIn profile
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const personURN = `urn:li:person:${profileResponse.data.sub}`;

    // Post content to LinkedIn
    const postResponse = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: personURN,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: postContent },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
      }
    );

    res.send(`
      <h2>✅ LinkedIn Post Successful!</h2>
      <pre>${postContent}</pre>
      <p><strong>Post URN:</strong> ${postResponse.data.id || "N/A"}</p>
      <p><strong>Profile:</strong> ${profileResponse.data.name}</p>
    `);
  } catch (err) {
    console.error(
      "Error posting to LinkedIn:",
      err.response?.data || err.message
    );
    res.status(500).send("❌ Error posting to LinkedIn. Check server logs.");
  }
});

app.listen(PORT, () => {
  console.log(`LinkedIn Auto-Post Service running at http://localhost:${PORT}`);
  console.log("✅ Visit http://localhost:4001 to login and post file content!");
});
