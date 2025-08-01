import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useEffect, useState } from "react";

interface GoogleSignInButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: (message: string) => void;
  loading?: boolean;
  mode: "login" | "register";
}

const GoogleSignInButton = ({ onSuccess, onError, loading, mode }: GoogleSignInButtonProps) => {
  const [buttonWidth, setButtonWidth] = useState<number>(300);

  useEffect(() => {
    const updateWidth = () => {
      const targetId = mode === "login" ? "login-btn" : "register-btn";
      const targetBtn = document.getElementById(targetId);
      if (targetBtn) {
        const width = Math.round(targetBtn.offsetWidth);
        setButtonWidth(width);
      }
    };

    updateWidth(); // Set initial width
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [mode]);

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => onError?.("Google login failed.")}
        useOneTap
        theme="filled_blue"
        text="continue_with"
        shape="rectangular"
        width={buttonWidth}
      />
      {loading && <p className="text-sm text-gray-500 mt-2">Signing in with Google...</p>}
    </div>
  );
};

export default GoogleSignInButton;
