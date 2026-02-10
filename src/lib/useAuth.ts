"use client";

import { useState, useEffect } from "react";

export type UserRole = "ADMIN" | "USTADZ" | "ORANG_TUA";

interface UserSession {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { user, isLoading };
}
