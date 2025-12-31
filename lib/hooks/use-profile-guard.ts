"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkProfileCompletion } from "@/lib/utils/profile-completion";

/**
 * Custom hook to guard routes that require mandatory profile fields to be completed.
 * Redirects to dashboard (which shows the lock screen) if mandatory fields are incomplete.
 *
 * @returns Object with completion status and loading state
 */
export function useProfileGuard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const [profileRes, preferencesRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/preferences"),
        ]);

        if (profileRes.ok && preferencesRes.ok) {
          const [profileData, preferencesData] = await Promise.all([
            profileRes.json(),
            preferencesRes.json(),
          ]);

          const completionStatus = checkProfileCompletion(
            profileData.profile,
            preferencesData.preferences
          );

          if (!completionStatus.isMandatoryComplete) {
            // Redirect to dashboard which will show the lock screen
            router.push("/dashboard");
            return;
          }

          setIsUnlocked(true);
        } else {
          // If we can't fetch profile data, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        // On error, redirect to dashboard
        router.push("/dashboard");
      } finally {
        setIsChecking(false);
      }
    }

    checkAccess();
  }, [router]);

  return { isChecking, isUnlocked };
}
