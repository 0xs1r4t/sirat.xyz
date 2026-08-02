import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { URL } from "node:url";

/**
 * One-off helper to (re)generate a Spotify refresh token via the
 * Authorization Code flow. Run whenever the stored SPOTIFY_REFRESH_TOKEN
 * is dead (revoked, scopes changed, client secret rotated, etc).
 *
 * Usage:
 *   npm run spotify:auth
 *
 * Make sure http://127.0.0.1:8888/callback is added as a Redirect URI
 * in the Spotify Developer Dashboard for this app before running.
 *
 * This does NOT spin up a local server to catch the redirect (that
 * breaks under WSL2, remote dev boxes, containers, etc). Instead: open
 * the printed URL, approve access, then the browser will try to load
 * 127.0.0.1:8888/callback and fail to connect — that's expected. Copy
 * the full URL from the address bar (it still has ?code=... in it) and
 * paste it back here.
 */

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";

const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-recently-played",
].join(" ");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in the environment."
  );
  process.exit(1);
}

const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
authorizeUrl.searchParams.set("client_id", CLIENT_ID);
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authorizeUrl.searchParams.set("scope", SCOPES);

console.log("\n1. Open this URL in your browser and approve access:\n");
console.log(authorizeUrl.toString());
console.log(
  "\n2. The browser will fail to load the redirect (that's expected) —" +
    " copy the full URL from the address bar.\n"
);

const rl = readline.createInterface({ input: stdin, output: stdout });
const pasted = await rl.question("3. Paste that URL here: ");
rl.close();

let code;
try {
  const redirected = new URL(pasted.trim());
  code = redirected.searchParams.get("code");
  const error = redirected.searchParams.get("error");
  if (error) throw new Error(error);
  if (!code) throw new Error("no code param found in that URL");
} catch (err) {
  console.error(`\nCouldn't extract an authorization code: ${err.message}`);
  process.exit(1);
}

const basicToken = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
  "base64"
);

const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${basicToken}`,
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  }),
});

const tokenData = await tokenResponse.json();

if (!tokenResponse.ok) {
  console.error("\nToken exchange failed:", tokenData);
  process.exit(1);
}

console.log("\nNew refresh token (save this as SPOTIFY_REFRESH_TOKEN):\n");
console.log(tokenData.refresh_token);
console.log("\nAccess token (short-lived, for reference only):\n");
console.log(tokenData.access_token);
