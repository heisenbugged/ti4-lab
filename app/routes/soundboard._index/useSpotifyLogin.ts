import { useCallback, useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";

interface SpotifyTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export function useSpotifyLogin() {
  const [tokens, setTokens] = useState<SpotifyTokens>({
    accessToken: null,
    refreshToken: null,
  });
  const refreshFetcher = useFetcher<{ accessToken: string }>();

  // Function to handle refresh
  // Memoize the refresh function with useCallback
  const refreshSpotifyToken = useCallback(() => {
    refreshFetcher.submit(null, {
      method: "get",
      action: "/soundboard/refresh",
    });
  }, [refreshFetcher]);

  // Set up automatic refresh every 15 minutes
  useEffect(() => {
    const refreshInterval = setInterval(refreshSpotifyToken, 15 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [refreshSpotifyToken]);

  // handle refresh response
  useEffect(() => {
    if (refreshFetcher.data !== undefined) {
      const accessToken = refreshFetcher.data.accessToken;
      setTokens((prev) => ({ ...prev, accessToken }));
    }
  }, [refreshFetcher.data]);

  // use effect is so it's done client side only
  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
      }
      return null;
    };

    setTokens({
      accessToken: getCookie("spotifyAccessToken"),
      refreshToken: getCookie("spotifyRefreshToken"),
    });
  }, []);

  return { ...tokens, refreshSpotifyToken };
}
