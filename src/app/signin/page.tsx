"use client";
import React from "react";
import SignInButton from "@/components/SignInButton";

export default function SignInPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-md px-4 pt-24 text-white">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 opacity-80">Use Google to continue.</p>
      <div className="mt-6">
        <SignInButton next="/onboarding" />
      </div>
    </div>
  );
}
