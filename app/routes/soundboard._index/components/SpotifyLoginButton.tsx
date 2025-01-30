import querystring from "querystring";
import { Button } from "@mantine/core";
import { IconBrandSpotify } from "@tabler/icons-react";

type Props = {
  accessToken: string | null;
  spotifyClientId: string;
  spotifyCallbackUrl: string;
};

export function SpotifyLoginButton({
  spotifyClientId,
  spotifyCallbackUrl,
  accessToken,
}: Props) {
  const spotifyAuthParams = {
    response_type: "code",
    client_id: spotifyClientId,
    scope: [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "app-remote-control",
      "streaming",
      "playlist-read-private",
      "playlist-read-collaborative",
      "user-read-playback-position",
    ].join(" "),
    redirect_uri: spotifyCallbackUrl,
  };

  return (
    <>
      {!accessToken ? (
        <Button
          leftSection={<IconBrandSpotify />}
          color="green"
          variant="filled"
          component="a"
          href={`https://accounts.spotify.com/authorize?${querystring.stringify(spotifyAuthParams)}`}
        >
          Login with Spotify
        </Button>
      ) : undefined}
    </>
  );
}
