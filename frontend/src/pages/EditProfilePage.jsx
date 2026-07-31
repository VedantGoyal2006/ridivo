import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Edit Profile Page Redirect Wrapper
 * Redirects legacy edit links directly to the new unified profile overview page.
 */
export default function EditProfilePage() {
  return <Navigate to="/profile" replace />;
}
