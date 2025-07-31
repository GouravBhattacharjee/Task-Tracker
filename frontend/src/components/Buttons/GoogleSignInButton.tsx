import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface GoogleSignInButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: (message: string) => void;
  loading?: boolean;
}

const GoogleSignInButton = ({ onSuccess, onError, loading }: GoogleSignInButtonProps) => {
  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => onError?.("Google login failed.")}
        useOneTap
        theme="filled_blue"
        text="continue_with"
        shape="rectangular"
        width="100%"  // ensures full width
      />
      {loading && <p className="text-sm text-gray-500 mt-2">Signing in with Google...</p>}
    </div>
  );
};

export default GoogleSignInButton;
