import { GraduationCap, School } from "lucide-react";
import * as z from "zod";

export const USER_ROLES = {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin",
};

export const ROLE_OPTIONS = [
    {
        value: USER_ROLES.STUDENT,
        label: "Student",
        icon: GraduationCap,
    },
    {
        value: USER_ROLES.TEACHER,
        label: "Teacher",
        icon: School,
    },
];

export const DEPARTMENTS = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Economics",
    "Business Administration",
    "Engineering",
    "Psychology",
    "Sociology",
    "Political Science",
    "Philosophy",
    "Education",
    "Fine Arts",
    "Music",
    "Physical Education",
    "Law",
] as const;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
    value: dept,
    label: dept,
}));

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];

const envSchema = z.object({
    VITE_CLOUDINARY_UPLOAD_URL: z.string().url("VITE_CLOUDINARY_UPLOAD_URL must be a valid URL"),
    VITE_CLOUDINARY_CLOUD_NAME: z.string().min(1, "VITE_CLOUDINARY_CLOUD_NAME is required"),
    VITE_CLOUDINARY_UPLOAD_PRESET: z.string().min(1, "VITE_CLOUDINARY_UPLOAD_PRESET is required"),
    VITE_BACKEND_BASE_URL: z.string().url("VITE_BACKEND_BASE_URL must be a valid URL"),
    VITE_API_URL: z.string().url("VITE_API_URL must be a valid URL").optional(),
    VITE_ACCESS_TOKEN_KEY: z.string().min(1, "VITE_ACCESS_TOKEN_KEY is required").optional(),
    VITE_REFRESH_TOKEN_KEY: z.string().min(1, "VITE_REFRESH_TOKEN_KEY is required").optional(),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
    const issues = parsedEnv.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
}

const env = parsedEnv.data;

export const CLOUDINARY_UPLOAD_URL = env.VITE_CLOUDINARY_UPLOAD_URL;
export const CLOUDINARY_CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME;
export const BACKEND_BASE_URL = env.VITE_BACKEND_BASE_URL;

export const BASE_URL = env.VITE_API_URL;
export const ACCESS_TOKEN_KEY = env.VITE_ACCESS_TOKEN_KEY;
export const REFRESH_TOKEN_KEY = env.VITE_REFRESH_TOKEN_KEY;

export const REFRESH_TOKEN_URL = `${BASE_URL}/refresh-token`;

export const CLOUDINARY_UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET;