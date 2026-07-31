import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Driver Verification Page Redirect Wrapper
 * Redirects legacy links directly to the unified profile verification tab.
 */
export default function VerificationPage() {
  return <Navigate to="/profile?tab=verification" replace />;
}
