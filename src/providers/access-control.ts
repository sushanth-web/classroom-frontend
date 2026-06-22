import type { AccessControlProvider } from "@refinedev/core";
import type { User } from "@/types";

// Reads the role persisted by the auth provider on login/register.
const getRole = (): string | null => {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        const parsed: User = JSON.parse(raw);
        return parsed.role ?? null;
    } catch {
        return null;
    }
};

// Resources a teacher is allowed to create/edit (not delete).
const TEACHER_WRITABLE = new Set(["classes", "enrollments"]);

/**
 * Role-based UI gating. Refine's CreateButton/EditButton/DeleteButton/ShowButton
 * consult this via `useCan`, so denying here hides/disables the action everywhere.
 *
 * - admin    → full access
 * - teacher  → read everything; create/edit classes & manage enrollments; no deletes
 * - student  → read-only; may create enrollments (join a class)
 */
export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }) => {
        const role = getRole();

        if (role === "admin") return { can: true };

        // Everyone signed in can read.
        if (action === "list" || action === "show") return { can: true };

        if (role === "teacher") {
            if (
                (action === "create" || action === "edit") &&
                resource &&
                TEACHER_WRITABLE.has(resource)
            ) {
                return { can: true };
            }
            return {
                can: false,
                reason: "Only admins can perform this action.",
            };
        }

        if (role === "student") {
            if (action === "create" && resource === "enrollments") {
                return { can: true };
            }
            return {
                can: false,
                reason: "Students have read-only access.",
            };
        }

        return { can: false, reason: "You do not have permission for this action." };
    },
    options: {
        buttons: {
            enableAccessControl: true,
            hideIfUnauthorized: true,
        },
    },
};
