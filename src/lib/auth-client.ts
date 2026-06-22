import { createAuthClient } from "better-auth/react";
import { BACKEND_BASE_URL, USER_ROLES } from "@/providers/constants";

export const authClient = createAuthClient({
  // BACKEND_BASE_URL ends with "/api/", so this resolves to
  // e.g. http://localhost:8080/api/auth
  baseURL: `${BACKEND_BASE_URL}auth`,
  user: {
    additionalFields: {
      role: {
        type: Object.values(USER_ROLES),
        required: true,
        defaultValue: "student",
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
