import { SpotifyApi, type AccessToken } from "@spotify/web-api-ts-sdk";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN as string;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const basic_token = Buffer.from(
  `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
).toString("base64");

export const getAccessToken = async (): Promise<AccessToken> => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic_token}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  return response.json();
};

export const getSpotifyApi = async (): Promise<SpotifyApi> => {
  const access_token = await getAccessToken();
  return SpotifyApi.withAccessToken(SPOTIFY_CLIENT_ID, access_token);
};
