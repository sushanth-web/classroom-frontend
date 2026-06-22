import { useShow } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Layers, Users } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import {
    ShowView,
    ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import type { Department } from "@/types";

type DepartmentSubject = {
    id: number;
    name: string;
    code?: string | null;
    description?: string | null;
    createdAt?: string | null;
};

const DepartmentsShow = () => {
    const { id } = useParams();
    const departmentId = id ?? "";

    const { query } = useShow<Department>({
        resource: "departments",
    });

    const department = query.data?.data;

    const subjectColumns = useMemo<ColumnDef<DepartmentSubject>[]>(
        () => [
            {
                id: "code",
                accessorKey: "code",
                size: 120,
                header: () => <p className="column-title ml-2">Code</p>,
                cell: ({ getValue }) => {
                    const code = getValue<string>();
                    return code ? (
                        <Badge>{code}</Badge>
                    ) : (
                        <span className="text-muted-foreground ml-2">No code</span>
                    );
                },
            },
            {
                id: "name",
                accessorKey: "name",
                size: 220,
                header: () => <p className="column-title">Subject</p>,
                cell: ({ getValue }) => (
                    <span className="text-foreground">{getValue<string>()}</span>
                ),
            },
            {
                id: "description",
                accessorKey: "description",
                size: 320,
                header: () => <p className="column-title">Description</p>,
                cell: ({ getValue }) => {
                    const description = getValue<string>();
                    return description ? (
                        <span className="truncate line-clamp-2">{description}</span>
                    ) : (
                        <span className="text-muted-foreground">No description</span>
                    );
                },
            },
            {
                id: "details",
                size: 140,
                header: () => <p className="column-title">Details</p>,
                cell: ({ row }) => (
                    <ShowButton
                        resource="subjects"
                        recordItemId={row.original.id}
                        variant="outline"
                        size="sm"
                    >
                        View
                    </ShowButton>
                ),
            },
        ],
        []
    );

    const subjectsTable = useTable<DepartmentSubject>({
        columns: subjectColumns,
        refineCoreProps: {
            resource: `departments/${departmentId}/subjects`,
            pagination: {
                pageSize: 10,
                mode: "server",
            },
        },
    });

    if (query.isLoading || query.isError || !department) {
        return (
            <ShowView className="class-view">
                <ShowViewHeader resource="departments" title="Department Details" />
                <p className="text-sm text-muted-foreground">
                    {query.isLoading
                        ? "Loading department details..."
                        : query.isError
                            ? "Failed to load department details."
                            : "Department details not found."}
                </p>
            </ShowView>
        );
    }

    const totals = department.totals ?? {
        subjects: 0,
        classes: 0,
        enrolledStudents: 0,
    };

    return (
        <ShowView className="class-view space-y-6">
            <ShowViewHeader resource="departments" title={department.name} />

            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex w-full flex-row items-center justify-between">
                    <CardTitle>Overview</CardTitle>
                    <Badge variant="secondary">{department.code}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {department.description ?? "No description provided."}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                <span>Total Subjects</span>
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {totals.subjects}
                            </div>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                <span>Total Classes</span>
                                <Layers className="h-4 w-4" />
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {totals.classes}
                            </div>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                <span>Enrolled Students</span>
                                <Users className="h-4 w-4" />
                            </div>
                            <div className="mt-2 text-2xl font-semibold">
                                {totals.enrolledStudents}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Subjects</CardTitle>
                    <Badge variant="secondary">{totals.subjects}</Badge>
                </CardHeader>
                <CardContent>
                    <DataTable table={subjectsTable} />
                </CardContent>
            </Card>
        </ShowView>
    );
};

export default DepartmentsShow;
