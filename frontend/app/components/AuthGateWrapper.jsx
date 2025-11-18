"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AuthGateWrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      setAuthenticated(!!token);
    } catch (e) {
      setAuthenticated(false);
    }
  }, []);

  const isLoginPage = pathname === "/login";
  const allowDevPaths = ["/usuarios"]; // rutas permitidas sin auth

  if (!authenticated && !isLoginPage && !allowDevPaths.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
