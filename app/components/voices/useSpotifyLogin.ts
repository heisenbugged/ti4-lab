import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

const getCookie = (name: string): string | null => {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

export function useSpotifyLogin() {
  const [cookieToken, setCookieToken] = useState<string | null>(null);
  const refreshFetcher = useFetcher<{ accessToken: string }>();
  const { submit } = refreshFetcher;

  // Refresh the access token every 15 minutes.
  useEffect(() => {
    const refresh = () =>
      submit(null, { method: "get", action: "/voices/refresh" });
    const refreshInterval = setInterval(refresh, 15 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [submit]);

  // Read after hydration; the server render has no cookie.
  useEffect(() => {
    setCookieToken(getCookie("spotifyAccessToken"));
  }, []);

  return {
    accessToken: refreshFetcher.data?.accessToken ?? cookieToken,
  };
}
