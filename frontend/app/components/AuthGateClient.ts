"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = { children?: React.ReactNode };

export default function AuthGateClient({ children }: Props) {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const pathname = usePathname() ?? "";

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        setAuthenticated(!!token);
      } else {
        setAuthenticated(false);
      }
    } catch (e) {
      setAuthenticated(false);
    }
  }, []);

  const isLoginPage = pathname === "/login";
  const allowDevPaths = ["/usuarios"]; // routes allowed without auth for dev

  if (!authenticated && !isLoginPage && !allowDevPaths.includes(pathname)) {
    return null;
  }

  return React.createElement(React.Fragment, null, children);
}
