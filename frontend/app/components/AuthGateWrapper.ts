"use client";
import React from "react";
import AuthGateClient from "./AuthGateClient";

type Props = { children?: React.ReactNode };

export default function AuthGateWrapper({ children }: Props) {
  return React.createElement(AuthGateClient, null, children);
}
