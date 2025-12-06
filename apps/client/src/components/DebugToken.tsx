"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function DebugToken() {
    const { getToken } = useAuth();
    const { user } = useUser();

    useEffect(() => {
        const logToken = async () => {
            try {
                const token = await getToken();
                console.log("🔥 Clerk Token (Raw):", token);

                if (token) {
                    const parts = token.split('.');
                    if (parts.length === 3 && parts[1]) {
                        const payload = JSON.parse(atob(parts[1]));
                        console.log("🔓 Decoded Token Payload:", payload);
                    }
                }

                console.log("👤 User Metadata (from useUser):", user?.publicMetadata);
            } catch (error) {
                console.error("Error getting token:", error);
            }
        };

        if (user) {
            logToken();
        }
    }, [getToken, user]);

    return null;
}
