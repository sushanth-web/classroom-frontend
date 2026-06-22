export type Department = {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    totalSubjects?: number;
    createdAt?: string;
    updatedAt?: string;
    totals?: {
        subjects: number;
        classes: number;
        enrolledStudents: number;
    };
};

export type Subject = {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    departmentId: number;
    department?: Department | null;
    createdAt?: string;
    updatedAt?: string;
    totals?: {
        classes: number;
    };
};

export type Enrollment = {
    id: number;
    studentId: string;
    classId: number;
    createdAt?: string;
    class?: ClassDetails;
    subject?: Subject;
    department?: Department;
    teacher?: User;
};

export type StatsOverview = {
    users: number;
    teachers: number;
    admins: number;
    subjects: number;
    departments: number;
    classes: number;
};

export type ChartStats = {
    usersByRole: { role: string; total: number }[];
    subjectsByDepartment: {
        departmentId: number;
        departmentName: string;
        totalSubjects: number;
    }[];
    classesBySubject: {
        subjectId: number;
        subjectName: string;
        totalClasses: number;
    }[];
};

export type ListResponse<T = unknown> = {
    data?: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type CreateResponse<T = unknown> = {
    data?: T;
};

export type GetOneResponse<T = unknown> = {
    data?: T;
};

declare global {
    interface CloudinaryUploadWidgetResults {
        event: string;
        info: {
            secure_url: string;
            public_id: string;
            delete_token?: string;
            resource_type: string;
            original_filename: string;
        };
    }

    interface CloudinaryWidget {
        open: () => void;
    }

    interface Window {
        cloudinary?: {
            createUploadWidget: (
                options: Record<string, unknown>,
                callback: (
                    error: unknown,
                    result: CloudinaryUploadWidgetResults
                ) => void
            ) => CloudinaryWidget;
        };
    }
}

export interface UploadWidgetValue {
    url: string;
    publicId: string;
}

export interface UploadWidgetProps {
    value?: UploadWidgetValue | null;
    onChange?: (value: UploadWidgetValue | null) => void;
    disabled?: boolean;
}

export enum UserRole {
    STUDENT = "student",
    TEACHER = "teacher",
    ADMIN = "admin",
}

export type User = {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
    imageCldPubId?: string;
    department?: string;
};

export type Schedule = {
    day: string;
    startTime: string;
    endTime: string;
};

export type ClassDetails = {
    id: number;
    name: string;
    description: string;
    status: "active" | "inactive" | "archived";
    capacity: number;
    courseCode?: string;
    courseName?: string;
    bannerUrl?: string;
    bannerCldPubId?: string;
    subject?: Subject;
    teacher?: User;
    department?: Department;
    schedules: Schedule[];
    inviteCode?: string;
    enrolledCount?: number;
    availableSpots?: number;
};

export type SignUpPayload = {
    email: string;
    name: string;
    password: string;
    image?: string;
    imageCldPubId?: string;
    role: UserRole;
};