"use client";

import { IUser } from "@/types/user";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface VerifySignInResponse {
  success: boolean;
  user: IUser;
}

export const useSignInMutation = () => {
  return useMutation<string, Error, string>({
    mutationFn: signInRequest,
    onSuccess: (data) => {
      toast(data);
    },
    onError: (error) => {
      toast("Something went wrong");
      console.error("Login verification error:", error);
    },
  });
};

export const useVerifySignin = () => {
  const router = useRouter();
  return useMutation<VerifySignInResponse, Error, string>({
    mutationFn: verifySignIn,
    onSuccess: (data) => {
      if (data.user.isCompleted) {
        router.push("/events");
      } else {
        router.push("/profile");
      }
    },
    onError: ({ message }) => {
      toast(message);
    },
  });
};

export const useMe = (): UseQueryResult<IUser, any> => {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: 0,
  });
};

const verifySignIn = async (token: string) => {
  const response = await fetch("/api/auth/verify-signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Login request failed");
  }

  return data;
};

const signInRequest = async (email: string) => {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Login request failed");
  }

  return response.json();
};

async function fetchMe(): Promise<IUser> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}
