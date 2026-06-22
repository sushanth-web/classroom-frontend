import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { CreateButton } from "@/components/refine-ui/buttons/create";

import { Department } from "@/types";

const DepartmentsList = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const departmentColumns = useMemo<ColumnDef<Department>[]>(
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
                header: () => <p className="column-title">Name</p>,
                cell: ({ getValue }) => (
                    <span className="text-foreground">{getValue<string>()}</span>
                ),
                filterFn: "includesString",
            },
            {
                id: "totalSubjects",
                accessorKey: "totalSubjects",
                size: 140,
                header: () => <p className="column-title">Subjects</p>,
                cell: ({ getValue }) => {
                    const total = getValue<number>();
                    return <Badge variant="secondary">{total ?? 0}</Badge>;
                },
            },
            {
                id: "description",
                accessorKey: "description",
                size: 300,
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
                id: "actions",
                size: 240,
                header: () => <p className="column-title">Actions</p>,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <ShowButton
                            resource="departments"
                            recordItemId={row.original.id}
                            variant="outline"
                            size="sm"
                        >
                            View
                        </ShowButton>
                        <EditButton
                            resource="departments"
                            recordItemId={row.original.id}
                            variant="outline"
                            size="sm"
                        >
                            Edit
                        </EditButton>
                        <DeleteButton
                            resource="departments"
                            recordItemId={row.original.id}
                            size="sm"
                        >
                            Delete
                        </DeleteButton>
                    </div>
                ),
            },
        ],
        []
    );

    const searchFilters = searchQuery
        ? [
              {
                  field: "name",
                  operator: "contains" as const,
                  value: searchQuery,
              },
              {
                  field: "code",
                  operator: "contains" as const,
                  value: searchQuery,
              },
          ]
        : [];

    const departmentsTable = useTable<Department>({
        columns: departmentColumns,
        refineCoreProps: {
            resource: "departments",
            pagination: { pageSize: 10, mode: "server" },
            filters: {
                permanent: [...searchFilters],
            },
            sorters: {
                initial: [{ field: "id", order: "desc" }],
            },
        },
    });

    return (
        <ListView>
            <Breadcrumb />

            <h1 className="page-title">Departments</h1>

            <div className="intro-row">
                <p>Quick access to essential metrics and management tools.</p>

                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <Input
                            type="text"
                            placeholder="Search by name or code..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <CreateButton resource="departments" />
                </div>
            </div>

            <DataTable table={departmentsTable} />
        </ListView>
    );
};

export default DepartmentsList;
