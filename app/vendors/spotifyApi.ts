export type SpotifyPlaybackState = {
  context: {
    uri: string;
    type: string;
    href: string;
    external_urls: {
      spotify: string;
    };
  } | null;
  track: {
    name: string;
    id: string;
    uri: string;
    external_urls: {
      spotify: string;
    };
  };
  position: number;
  isPlaying: boolean;
  artists: {
    name: string;
    id: string;
    uri: string;
  }[];
  albumImage: {
    height: number;
    width: number;
    url: string;
  };
};

export const spotifyApi = {
  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string,
  ) {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      });

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      throw error;
    }
  },

  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string,
  ) {
    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  },

  async getCurrentPlayback(token: string) {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        context: data.context,
        track: data.item,
        position: data.progress_ms,
        isPlaying: data.is_playing,
        artists: data.item.artists.map((artist: any) => ({
          name: artist.name,
          id: artist.id,
          uri: artist.external_urls.spotify,
        })),
        albumImage: {
          height: data.item.album.images[2].height,
          width: data.item.album.images[2].width,
          url: data.item.album.images[2].url,
        },
      } as SpotifyPlaybackState;
    } catch (error) {
      console.error("Error getting Spotify playback state:", error);
      return null;
    }
  },

  async startPlayback(token: string, trackUri: string, positionMs: number) {
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
          position_ms: positionMs,
        }),
      });
    } catch (error) {
      console.error("Error controlling Spotify playback:", error);
    }
  },

  async startPlaylist(token: string, playlistId: string) {
    await fetch(`https://api.spotify.com/v1/me/player/play`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        context_uri: playlistId,
        offset: {
          position: 0,
        },
      }),
    });
  },

  async resumePlaybackAtPosition(
    token: string,
    contextUri: string,
    trackUri: string,
    positionMs: number,
  ) {
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context_uri: contextUri,
          offset: {
            uri: trackUri,
          },
          position_ms: positionMs,
        }),
      });
    } catch (error) {
      console.error("Error resuming Spotify playback:", error);
    }
  },

  async getAvailableDevices(token: string) {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/devices",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.devices;
    } catch (error) {
      console.error("Error getting available Spotify devices:", error);
      return [];
    }
  },

  async transferPlayback(token: string, deviceId: string) {
    try {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: true,
        }),
      });
      return true;
    } catch (error) {
      console.error("Error transferring playback to device:", error);
      return false;
    }
  },
};
