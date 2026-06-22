import { AdvancedImage } from "@cloudinary/react";
import { useShow, useCustomMutation, useApiUrl, useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import {
    ShowView,
    ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { bannerPhoto } from "@/lib/cloudinary.ts";
import { Check, Copy } from "lucide-react";
import { ClassDetails, User } from "@/types/index.ts";

type ClassUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
};

const ClassesShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const apiUrl = useApiUrl();
    const classId = id ?? "";

    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const { query } = useShow<ClassDetails>({
        resource: "classes",
    });

    const classDetails = query.data?.data;

    const {
        mutate: enrollMutate,
        mutation: { isPending: isEnrolling },
    } = useCustomMutation();
    const { mutate: unenrollMutate } = useCustomMutation();

    // List of students available to enroll.
    const { query: studentsListQuery } = useList<User>({
        resource: "users",
        filters: [
            {
                field: "role",
                operator: "eq",
                value: "student",
            },
        ],
        pagination: {
            pageSize: 100,
        },
    });

    const availableStudents = studentsListQuery.data?.data ?? [];

    // useTable is created below; expose a ref-stable refetch through a holder.
    const refetchHolder = useMemo<{ current: () => void }>(
        () => ({ current: () => {} }),
        []
    );

    const handleUnenroll = useCallback(
        (studentId: string) => {
            if (!classId) return;

            unenrollMutate(
                {
                    url: `${apiUrl}/enrollments`,
                    method: "delete",
                    values: {
                        classId: Number(classId),
                        studentId,
                    },
                    meta: {
                        query: {
                            classId: Number(classId),
                            studentId,
                        },
                    },
                },
                {
                    onSuccess: () => {
                        refetchHolder.current();
                        void query.refetch();
                    },
                }
            );
        },
        [apiUrl, classId, query, refetchHolder, unenrollMutate]
    );

    const studentColumns = useMemo<ColumnDef<ClassUser>[]>(
        () => [
            {
                id: "name",
                accessorKey: "name",
                size: 240,
                header: () => <p className="column-title">Student</p>,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                            {row.original.image && (
                                <AvatarImage src={row.original.image} alt={row.original.name} />
                            )}
                            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col truncate">
                            <span className="truncate">{row.original.name}</span>
                            <span className="text-xs text-muted-foreground truncate">
                {row.original.email}
              </span>
                        </div>
                    </div>
                ),
            },
            {
                id: "details",
                size: 220,
                header: () => <p className="column-title">Details</p>,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <ShowButton
                            resource="users"
                            recordItemId={row.original.id}
                            variant="outline"
                            size="sm"
                        >
                            View
                        </ShowButton>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnenroll(row.original.id)}
                        >
                            Unenroll
                        </Button>
                    </div>
                ),
            },
        ],
        [handleUnenroll]
    );

    const studentsTable = useTable<ClassUser>({
        columns: studentColumns,
        refineCoreProps: {
            resource: `classes/${classId}/users`,
            pagination: {
                pageSize: 3,
                mode: "server",
            },
            filters: {
                permanent: [
                    {
                        field: "role",
                        operator: "eq",
                        value: "student",
                    },
                ],
            },
        },
    });

    // Keep the refetch holder pointed at the current table query.
    refetchHolder.current = () => {
        void studentsTable.refineCore.tableQuery.refetch();
    };

    const handleEnroll = () => {
        if (!classId || !selectedStudentId) return;

        enrollMutate(
            {
                url: `${apiUrl}/enrollments`,
                method: "post",
                values: {
                    classId: Number(classId),
                    studentId: selectedStudentId,
                },
            },
            {
                onSuccess: () => {
                    setSelectedStudentId("");
                    refetchHolder.current();
                    void query.refetch();
                },
            }
        );
    };

    if (query.isLoading || query.isError || !classDetails) {
        return (
            <ShowView className="class-view class-show">
                <ShowViewHeader resource="classes" title="Class Details" />
                <p className="state-message">
                    {query.isLoading
                        ? "Loading class details..."
                        : query.isError
                            ? "Failed to load class details."
                            : "Class details not found."}
                </p>
            </ShowView>
        );
    }

    const teacherName = classDetails.teacher?.name ?? "Unknown";
    const teacherInitials = teacherName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(
        teacherInitials || "NA"
    )}`;

    // Capacity warning logic.
    const capacity = classDetails.capacity ?? 0;
    const enrolledCount = classDetails.enrolledCount ?? 0;
    const ratio = capacity > 0 ? enrolledCount / capacity : 0;

    let capacityLabel = `${enrolledCount}/${capacity} enrolled`;
    let capacityVariant: "default" | "secondary" | "destructive" = "default";
    if (capacity > 0 && enrolledCount >= capacity) {
        capacityLabel = "FULL";
        capacityVariant = "destructive";
    } else if (ratio >= 0.8) {
        capacityVariant = "secondary";
    }

    const isFull = capacity > 0 && enrolledCount >= capacity;

    return (
        <ShowView className="class-view class-show space-y-6">
            <ShowViewHeader resource="classes" title="Class Details" />

            <div className="banner">
                {classDetails.bannerUrl ? (
                    classDetails.bannerUrl.includes("res.cloudinary.com") &&
                    classDetails.bannerCldPubId ? (
                        <AdvancedImage
                            cldImg={bannerPhoto(
                                classDetails.bannerCldPubId ?? "",
                                classDetails.name
                            )}
                            alt="Class Banner"
                        />
                    ) : (
                        <img
                            src={classDetails.bannerUrl}
                            alt={classDetails.name}
                            loading="lazy"
                        />
                    )
                ) : (
                    <div className="placeholder" />
                )}
            </div>

            <Card className="details-card">
                {/* Class Details */}
                <div>
                    <div className="details-header">
                        <div>
                            <h1>{classDetails.name}</h1>
                            <p>{classDetails.description}</p>
                        </div>

                        <div>
                            <Badge variant="outline">{classDetails.capacity} spots</Badge>
                            <Badge
                                variant={
                                    classDetails.status === "active" ? "default" : "secondary"
                                }
                                data-status={classDetails.status}
                            >
                                {classDetails.status.toUpperCase()}
                            </Badge>
                            <Badge variant={capacityVariant}>{capacityLabel}</Badge>
                        </div>
                    </div>

                    <div className="details-grid">
                        <div className="instructor">
                            <p>👨‍🏫 Instructor</p>
                            <div>
                                <img
                                    src={classDetails.teacher?.image ?? placeholderUrl}
                                    alt={teacherName}
                                />

                                <div>
                                    <p>{teacherName}</p>
                                    <p>{classDetails?.teacher?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="department">
                            <p>🏛️ Department</p>

                            <div>
                                <p>{classDetails?.department?.name}</p>
                                <p>{classDetails?.department?.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Subject Card */}
                <div className="subject">
                    <p>📚 Subject</p>

                    <div>
                        <Badge variant="outline">
                            Code: <span>{classDetails?.subject?.code}</span>
                        </Badge>
                        <p>{classDetails?.subject?.name}</p>
                        <p>{classDetails?.subject?.description}</p>
                    </div>
                </div>

                <Separator />

                {/* Join Class Section */}
                <div className="join">
                    <h2>🎓 Join Class</h2>

                    <ol>
                        <li>Ask your teacher for the invite code.</li>
                        <li>Click on &quot;Join Class&quot; button.</li>
                        <li>Paste the code and click &quot;Join&quot;</li>
                    </ol>

                    {classDetails.inviteCode && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Invite code:
                            </span>
                            <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                {classDetails.inviteCode}
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard?.writeText(
                                        classDetails.inviteCode ?? ""
                                    );
                                    setCopied(true);
                                    window.setTimeout(() => setCopied(false), 1500);
                                }}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    )}
                </div>

                <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate("/enrollments/join")}
                >
                    Join Class
                </Button>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Enroll Student control */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                            value={selectedStudentId}
                            onValueChange={setSelectedStudentId}
                            disabled={studentsListQuery.isLoading}
                        >
                            <SelectTrigger className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Select a student to enroll" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStudents.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.name} ({student.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleEnroll}
                            disabled={!selectedStudentId || isEnrolling || isFull}
                        >
                            {isEnrolling
                                ? "Enrolling..."
                                : isFull
                                    ? "Class Full"
                                    : "Enroll Student"}
                        </Button>
                    </div>

                    <DataTable table={studentsTable} />
                </CardContent>
            </Card>
        </ShowView>
    );
};

const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return `${parts[0][0] ?? ""}${
        parts[parts.length - 1][0] ?? ""
    }`.toUpperCase();
};

export default ClassesShow;
