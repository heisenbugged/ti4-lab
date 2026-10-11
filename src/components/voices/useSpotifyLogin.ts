import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { refreshSpotifyToken } from "~/server/spotify.functions";

const REFRESH_INTERVAL = 15 * 60 * 1000;

const getCookie = (name: string): string | null => {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

export function useSpotifyLogin() {
  const [cookieToken, setCookieToken] = useState<string | null>(null);

  // Refresh the access token every 15 minutes (the cookie one is fresh at first).
  const { data: refreshedToken } = useQuery({
    queryKey: ["spotify-access-token"],
    queryFn: () => refreshSpotifyToken(),
    initialData: null,
    staleTime: Infinity,
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: true,
  });

  // Read after hydration; the server render has no cookie.
  useEffect(() => {
    setCookieToken(getCookie("spotifyAccessToken"));
  }, []);

  return {
    accessToken: refreshedToken ?? cookieToken,
  };
}
