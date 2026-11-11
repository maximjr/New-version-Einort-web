import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { sendEmailVerification } from "firebase/auth";
import { ShieldAlert, MailCheck, RefreshCw } from "lucide-react";

export function ProtectedRoute({ requireAdmin = false }) {
  const { user, userData, loading } = useAuth();
  const [showRefresh, setShowRefresh] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setShowRefresh(true);
      }, 5000);
    } else {
      setShowRefresh(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSendVerification = async () => {
    if (!user) return;
    setIsSending(true);
    setErrorMsg(null);
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to dispatch verification email. Please try again shortly.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReloadUser = async () => {
    if (!user) return;
    setIsReloading(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        window.location.reload();
      } else {
        setErrorMsg("Email is not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Unable to refresh authentication state.");
    } finally {
      setIsReloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background relative">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        {showRefresh && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-500 max-w-sm text-center">
            <p className="text-sm text-slate-400">Authentication is taking longer than expected.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs bg-white/5 hover:bg-white/10 text-white px-4 py-2 border border-white/10 rounded tracking-wider uppercase"
            >
              Force Refresh Session
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Mandatory Email Verification for Sensitive Admin Routes
  if (requireAdmin && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface/80 border border-red-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-400">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-display font-medium text-white mb-3">
            Email Verification Required
          </h2>
          <p className="text-sm text-text-muted leading-relaxed mb-6 font-light">
            In accordance with zero-trust security policies, administrative access requires a cryptographically verified email address (<strong className="text-white">{user.email}</strong>).
          </p>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-left">
              {errorMsg}
            </div>
          )}

          {verificationSent ? (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2 justify-center">
              <MailCheck size={16} />
              <span>Verification email sent! Check your inbox and spam folder.</span>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSendVerification}
              disabled={isSending}
              className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <MailCheck size={16} />
              {isSending ? "Sending..." : "Send Verification Email"}
            </button>
            <button
              onClick={handleReloadUser}
              disabled={isReloading}
              className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={isReloading ? "animate-spin" : ""} />
              {isReloading ? "Checking status..." : "I've Verified My Email"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requireAdmin) {
    if (
      !userData ||
      (userData.role !== "admin" &&
        userData.role !== "super_admin" &&
        !userData.isAdmin)
    ) {
      return <Navigate to="/client-portal" replace />;
    }
  }

  return <Outlet />;
}
