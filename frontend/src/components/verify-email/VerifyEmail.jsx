import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VPXLogo from "../common/VPXLogo";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided.");
        return;
      }

      try {
        const res = await fetch(`https://vpx-backend.onrender.com/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid or expired verification link.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Cannot connect to server. Please try again.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0A0C10] p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6"><VPXLogo size="lg" /></div>

        {status === "verifying" && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-[#4D7EFF] border-t-transparent animate-spin" />
            <h2 className="text-xl font-semibold text-white mb-2">Verifying your email...</h2>
            <p className="text-gray-400 text-sm">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Email verified!</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2 px-3 text-sm font-bold rounded-lg transition duration-200"
              style={{ background: 'linear-gradient(135deg, #00F0FF, #4D7EFF)', color: '#000' }}
            >
              Continue to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Verification failed</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-3 text-sm font-bold rounded-lg bg-[#1E1F25] border border-gray-700 text-white transition duration-200"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
