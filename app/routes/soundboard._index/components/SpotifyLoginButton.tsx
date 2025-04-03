import querystring from "querystring";
import { Button } from "@mantine/core";
import { IconBrandSpotify } from "@tabler/icons-react";
import { useState, useEffect } from "react";
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
  const [hasAcceptedEula, setHasAcceptedEula] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);

  useEffect(() => {
    const acceptedEula = localStorage.getItem("acceptedEula");
    const acceptedPrivacy = localStorage.getItem("acceptedPrivacy");
    setHasAcceptedEula(acceptedEula === "true");
    setHasAcceptedPrivacy(acceptedPrivacy === "true");
  }, []);

  const spotifyAuthParams = {
    response_type: "code",
    client_id: spotifyClientId,
    scope: [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "playlist-read-private",
      "playlist-read-collaborative",
    ].join(" "),
    redirect_uri: spotifyCallbackUrl,
  };

  const handleEulaAccept = () => {
    localStorage.setItem("acceptedEula", "true");
    setHasAcceptedEula(true);
    setEulaOpened(false);
    setPrivacyOpened(true);
  };

  const handlePrivacyAccept = () => {
    localStorage.setItem("acceptedPrivacy", "true");
    setHasAcceptedPrivacy(true);
    setPrivacyOpened(false);
    window.location.href = `https://accounts.spotify.com/authorize?${querystring.stringify(spotifyAuthParams)}`;
  };

  const handleLoginClick = () => {
    if (!hasAcceptedEula) {
      setEulaOpened(true);
    } else if (!hasAcceptedPrivacy) {
      setPrivacyOpened(true);
    } else {
      window.location.href = `https://accounts.spotify.com/authorize?${querystring.stringify(spotifyAuthParams)}`;
    }
  };

  return (
    <>
      {!accessToken ? (
        <>
          <Button color="green" variant="filled" onClick={handleLoginClick}>
            Login
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
      ) : undefined}
    </>
  );
}
