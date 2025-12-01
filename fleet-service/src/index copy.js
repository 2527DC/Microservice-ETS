import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
const PORT = process.env.PORT || 4001;

// 🔹 Home route: LinkedIn login link with random post options
app.get("/", (req, res) => {
  const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid%20profile%20email%20w_member_social`;

  const postOptions = [
    "Hello from my LinkedIn API integration! 🚀",
    "Testing automated posts with LinkedIn API! 💻",
    "Just connected my app to LinkedIn API successfully! 🎯",
    "Exploring LinkedIn API capabilities for social automation! 🔧",
    "Successfully posted via LinkedIn REST API! 🌟",
    "Building cool things with LinkedIn API integration! ⚡",
  ];

  let html = `<h2>Login with LinkedIn & Auto-Post</h2>`;
  html += `<p>Choose a post message:</p>`;

  postOptions.forEach((message, index) => {
    const messageAuthURL = `${authURL}&state=${encodeURIComponent(message)}`;
    html += `<p><a href="${messageAuthURL}">${message}</a></p>`;
  });

  // Custom message option
  html += `
    <br>
    <form action="/custom-post" method="POST">
      <label><strong>Or write your own message:</strong></label><br>
      <textarea name="post_message" rows="3" cols="50" placeholder="Enter your custom post message..."></textarea><br>
      <button type="submit">Login & Post Custom Message</button>
    </form>
  `;

  res.send(html);
});

// 🔹 Handle custom post message
app.post("/custom-post", (req, res) => {
  const { post_message } = req.body;
  if (!post_message) {
    return res.redirect("/");
  }

  const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid%20profile%20email%20w_member_social&state=${encodeURIComponent(
    post_message
  )}`;

  res.redirect(authURL);
});

// 🔹 OAuth callback route - AUTOMATICALLY POSTS AFTER AUTH
app.get("/linkedin/callback", async (req, res) => {
  const code = req.query.code;
  let postMessage = req.query.state;

  // Generate random message if none provided
  if (!postMessage) {
    const messages = [
      "Hello from my LinkedIn API integration! 🚀",
      "Testing automated posts with LinkedIn API! 💻",
      "Just connected my app to LinkedIn API successfully! 🎯",
      "Exploring LinkedIn API capabilities for social automation! 🔧",
      "Successfully posted via LinkedIn REST API! 🌟",
      "Building cool things with LinkedIn API integration! ⚡",
      "Automated post via LinkedIn API with unique timestamp! 🕒",
      "LinkedIn API integration working perfectly! ✅",
    ];
    postMessage = messages[Math.floor(Math.random() * messages.length)];
  }

  // Add timestamp to make each post unique
  const timestamp = new Date().toLocaleString();
  const uniquePostMessage = `${postMessage} (Posted at: ${timestamp})`;

  if (!code) return res.status(400).send("❌ No code provided");

  try {
    // 1️⃣ Exchange authorization code for access token
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
    console.log("🔑 Access Token Received");

    // 2️⃣ Get LinkedIn profile
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("👤 Profile Data Received");

    const personURN = `urn:li:person:${profileResponse.data.sub}`;
    console.log("🆔 Person URN:", personURN);

    // 3️⃣ AUTOMATICALLY POST TO LINKEDIN PROFILE
    console.log("📝 Posting message:", uniquePostMessage);

    const postResponse = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: personURN,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: uniquePostMessage,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
      }
    );

    // 4️⃣ SUCCESS RESPONSE
    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="color: #0A66C2;">✅ LinkedIn Post Successful!</h1>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>📝 Message Posted:</strong> "${uniquePostMessage}"</p>
          <p><strong>🆔 Post URN:</strong> ${postResponse.data.id || "N/A"}</p>
          <p><strong>👤 Profile:</strong> ${profileResponse.data.name}</p>
          <p><strong>📧 Email:</strong> ${profileResponse.data.email}</p>
        </div>
        <p style="color: green;">✅ The post has been automatically published to your LinkedIn profile!</p>
        <br>
        <a href="/" style="background: #0A66C2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Post Another Message</a>
      </div>
    `);
  } catch (err) {
    console.error(
      "LinkedIn OAuth / Post Error:",
      err.response?.data || err.message
    );

    let errorMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="color: #d93025;">❌ Posting Error</h1>
        <div style="background: #fce8e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Message:</strong> ${
            err.response?.data?.message || err.message
          }</p>
          <p><strong>Code:</strong> ${err.response?.data?.code || "Unknown"}</p>
    `;

    // Special handling for duplicate content error
    if (err.response?.data?.message?.includes("duplicate")) {
      errorMessage += `
          <p style="color: #d93025;"><strong>💡 Solution:</strong> Try a different message or add unique text</p>
      `;
    }

    errorMessage += `
        </div>
        <a href="/" style="background: #0A66C2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Try Again with Different Message</a>
      </div>
    `;

    res.status(500).send(errorMessage);
  }
});

app.listen(PORT, () => {
  console.log(
    `👤 LinkedIn Auto-Post Service running at http://localhost:${PORT}`
  );
  console.log(
    `✅ After authentication, it will AUTOMATICALLY post to LinkedIn!`
  );
  console.log(`🔄 Each post includes a timestamp to avoid duplicates`);
});
