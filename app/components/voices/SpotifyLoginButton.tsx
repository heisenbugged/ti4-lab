import { Button } from "~/ui";
import { useState } from "react";
import { EULAModal } from "./EULAModal";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";

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
  const [eulaOpened, setEulaOpened] = useState(false);
  const [privacyOpened, setPrivacyOpened] = useState(false);
  const spotifyAuthParams = {
    response_type: "code",
    client_id: spotifyClientId,
    scope: [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
    ].join(" "),
    redirect_uri: spotifyCallbackUrl,
  };

  const goToSpotify = () => {
    window.location.href = `https://accounts.spotify.com/authorize?${new URLSearchParams(spotifyAuthParams)}`;
  };

  const handleEulaAccept = () => {
    localStorage.setItem("acceptedEula", "true");
    setEulaOpened(false);
    setPrivacyOpened(true);
  };

  const handlePrivacyAccept = () => {
    localStorage.setItem("acceptedPrivacy", "true");
    setPrivacyOpened(false);
    goToSpotify();
  };

  const handleLoginClick = () => {
    if (localStorage.getItem("acceptedEula") !== "true") {
      setEulaOpened(true);
    } else if (localStorage.getItem("acceptedPrivacy") !== "true") {
      setPrivacyOpened(true);
    } else {
      goToSpotify();
    }
  };

  if (accessToken) return null;

  return (
    <>
      <Button size="sm" onClick={handleLoginClick}>
        Log in
      </Button>

      <EULAModal
        opened={eulaOpened}
        onClose={() => setEulaOpened(false)}
        onAccept={handleEulaAccept}
      />

      <PrivacyPolicyModal
        opened={privacyOpened}
        onClose={() => setPrivacyOpened(false)}
        onAccept={handlePrivacyAccept}
      />
    </>
  );
}
