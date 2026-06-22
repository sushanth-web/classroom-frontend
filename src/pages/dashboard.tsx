import { useMemo } from "react";
import { useApiUrl, useCustom, useLink, useList } from "@refinedev/core";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  BookOpen,
  Building2,
  CalendarClock,
  GaugeCircle,
  GraduationCap,
  Layers,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  ChartStats,
  ClassDetails,
  Department,
  StatsOverview,
  Subject,
  User,
} from "@/types";

const roleColors = ["#f97316", "#0ea5e9", "#22c55e", "#a855f7"];
const capacityColors = ["#0ea5e9", "#e2e8f0"];

// ClassDetails has no createdAt in the local types; the classes endpoint
// returns it, so extend locally for the dashboard's time-series + feed.
type DashboardClass = ClassDetails & { createdAt?: string };

type LatestStats = {
  latestClasses: DashboardClass[];
  latestTeachers: User[];
};

const Dashboard = () => {
  const Link = useLink();
  const apiUrl = useApiUrl();

  // -- Client-side list aggregation (faithful to the reference dashboard) --
  const { query: usersQuery } = useList<User>({
    resource: "users",
    pagination: { mode: "off" },
  });

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { mode: "off" },
  });

  const { query: departmentsQuery } = useList<Department>({
    resource: "departments",
    pagination: { mode: "off" },
  });

  const { query: classesQuery } = useList<DashboardClass>({
    resource: "classes",
    pagination: { mode: "off" },
  });

  // -- Server stats endpoints (custom routes wrapped as { data }) --
  const { query: overviewQuery } = useCustom<{ data: StatsOverview }>({
    url: `${apiUrl}stats/overview`,
    method: "get",
  });

  const { query: latestQuery } = useCustom<{ data: LatestStats }>({
    url: `${apiUrl}stats/latest`,
    method: "get",
  });

  const { query: chartsQuery } = useCustom<{ data: ChartStats }>({
    url: `${apiUrl}stats/charts`,
    method: "get",
  });

  const users = usersQuery.data?.data ?? [];
  const subjects = subjectsQuery.data?.data ?? [];
  const departments = departmentsQuery.data?.data ?? [];
  const classes = classesQuery.data?.data ?? [];

  const overview = overviewQuery.data?.data?.data;
  const latest = latestQuery.data?.data?.data;
  const charts = chartsQuery.data?.data?.data;

  // -- Users by role (prefer server charts, fall back to client aggregation) --
  const usersByRole = useMemo(() => {
    if (charts?.usersByRole?.length) {
      return charts.usersByRole.map((entry) => ({
        role: entry.role,
        total: entry.total,
      }));
    }

    const counts = users.reduce<Record<string, number>>((acc, user) => {
      const role = user.role ?? "unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([role, total]) => ({ role, total }));
  }, [charts, users]);

  // -- Subjects per department --
  const subjectsByDepartment = useMemo(() => {
    if (charts?.subjectsByDepartment?.length) {
      return charts.subjectsByDepartment.map((entry) => ({
        departmentName: entry.departmentName,
        totalSubjects: entry.totalSubjects,
      }));
    }

    const counts = subjects.reduce<Record<string, number>>((acc, subject) => {
      const departmentName = subject.department?.name ?? "Unassigned";
      acc[departmentName] = (acc[departmentName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([departmentName, totalSubjects]) => ({
      departmentName,
      totalSubjects,
    }));
  }, [charts, subjects]);

  // -- Classes per subject --
  const classesBySubject = useMemo(() => {
    if (charts?.classesBySubject?.length) {
      return charts.classesBySubject.map((entry) => ({
        subjectName: entry.subjectName,
        totalClasses: entry.totalClasses,
      }));
    }

    const counts = classes.reduce<Record<string, number>>((acc, classItem) => {
      const subjectName = classItem.subject?.name ?? "Unassigned";
      acc[subjectName] = (acc[subjectName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([subjectName, totalClasses]) => ({
      subjectName,
      totalClasses,
    }));
  }, [charts, classes]);

  // -- Classes grouped by department (aggregate classes -> subject -> department) --
  const classesByDepartment = useMemo(() => {
    const counts = classes.reduce<Record<string, number>>((acc, classItem) => {
      const departmentName =
        classItem.department?.name ??
        classItem.subject?.department?.name ??
        "Unassigned";
      acc[departmentName] = (acc[departmentName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([departmentName, totalClasses]) => ({
        departmentName,
        totalClasses,
      }))
      .sort((a, b) => b.totalClasses - a.totalClasses);
  }, [classes]);

  // -- Enrollment trends: group classes by their created month as a proxy --
  const enrollmentTrends = useMemo(() => {
    const counts = classes.reduce<Record<string, number>>((acc, classItem) => {
      if (!classItem.createdAt) return acc;
      const key = format(parseISO(classItem.createdAt), "yyyy-MM");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => ({
        month: format(parseISO(`${key}-01`), "MMM yyyy"),
        total,
      }));
  }, [classes]);

  // -- Capacity status: utilised (enrolled) vs available across all classes --
  const capacityStats = useMemo(() => {
    const totals = classes.reduce(
      (acc, classItem) => {
        const capacity = classItem.capacity ?? 0;
        const enrolled =
          classItem.enrolledCount ??
          (classItem.availableSpots != null
            ? Math.max(capacity - classItem.availableSpots, 0)
            : 0);
        acc.capacity += capacity;
        acc.enrolled += Math.min(enrolled, capacity);
        return acc;
      },
      { capacity: 0, enrolled: 0 }
    );

    const available = Math.max(totals.capacity - totals.enrolled, 0);
    return {
      totalCapacity: totals.capacity,
      enrolled: totals.enrolled,
      available,
      data: [
        { name: "Utilised", value: totals.enrolled },
        { name: "Available", value: available },
      ],
    };
  }, [classes]);

  // -- Activity feed: prefer server stats/latest, fall back to client lists --
  const newestClasses = useMemo(() => {
    if (latest?.latestClasses?.length) {
      return latest.latestClasses.slice(0, 5);
    }

    return [...classes]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [latest, classes]);

  const newestTeachers = useMemo(() => {
    if (latest?.latestTeachers?.length) {
      return latest.latestTeachers.slice(0, 5);
    }

    return users
      .filter((user) => user.role === "teacher")
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [latest, users]);

  const topDepartments = useMemo(() => {
    return [...subjectsByDepartment]
      .sort((a, b) => b.totalSubjects - a.totalSubjects)
      .slice(0, 5)
      .map((item, index) => ({ ...item, departmentId: index }));
  }, [subjectsByDepartment]);

  const topSubjects = useMemo(() => {
    return [...classesBySubject]
      .sort((a, b) => b.totalClasses - a.totalClasses)
      .slice(0, 5)
      .map((item, index) => ({ ...item, subjectId: index }));
  }, [classesBySubject]);

  // -- Overview KPI cards (prefer server overview, fall back to list lengths) --
  const totalUsers = overview?.users ?? users.length;
  const totalTeachers =
    overview?.teachers ?? users.filter((u) => u.role === "teacher").length;
  const totalAdmins =
    overview?.admins ?? users.filter((u) => u.role === "admin").length;
  const totalSubjects = overview?.subjects ?? subjects.length;
  const totalDepartments = overview?.departments ?? departments.length;
  const totalClasses = overview?.classes ?? classes.length;

  const kpis = [
    { label: "Total Users", value: totalUsers, icon: Users, accent: "text-blue-600" },
    {
      label: "Teachers",
      value: totalTeachers,
      icon: GraduationCap,
      accent: "text-emerald-600",
    },
    {
      label: "Classes",
      value: totalClasses,
      icon: Layers,
      accent: "text-rose-600",
    },
    {
      label: "Departments",
      value: totalDepartments,
      icon: Building2,
      accent: "text-cyan-600",
    },
    {
      label: "Subjects",
      value: totalSubjects,
      icon: BookOpen,
      accent: "text-purple-600",
    },
    {
      label: "Admins",
      value: totalAdmins,
      icon: ShieldCheck,
      accent: "text-amber-600",
    },
  ];

  // -- Key derived metrics --
  const avgCapacity = useMemo(() => {
    if (!classes.length) return 0;
    const total = classes.reduce((sum, c) => sum + (c.capacity ?? 0), 0);
    return Math.round(total / classes.length);
  }, [classes]);

  const utilisationRate = capacityStats.totalCapacity
    ? Math.round((capacityStats.enrolled / capacityStats.totalCapacity) * 100)
    : 0;

  const classesPerDepartment = totalDepartments
    ? (totalClasses / totalDepartments).toFixed(1)
    : "0";

  const subjectsPerDepartment = totalDepartments
    ? (totalSubjects / totalDepartments).toFixed(1)
    : "0";

  const keyMetrics = [
    {
      label: "Avg. Capacity / Class",
      value: avgCapacity,
      icon: GaugeCircle,
      accent: "text-sky-600",
    },
    {
      label: "Total Enrolled",
      value: capacityStats.enrolled,
      icon: UserPlus,
      accent: "text-emerald-600",
    },
    {
      label: "Utilisation Rate",
      value: `${utilisationRate}%`,
      icon: TrendingUp,
      accent: "text-rose-600",
    },
    {
      label: "Classes / Department",
      value: classesPerDepartment,
      icon: Layers,
      accent: "text-amber-600",
    },
    {
      label: "Subjects / Department",
      value: subjectsPerDepartment,
      icon: BookOpen,
      accent: "text-purple-600",
    },
    {
      label: "Total Capacity",
      value: capacityStats.totalCapacity,
      icon: CalendarClock,
      accent: "text-cyan-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground">
          A quick snapshot of the latest activity and key metrics.
        </p>
      </div>

      {/* Overview cards */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {kpi.label}
                  </p>
                  <kpi.icon className={`h-4 w-4 ${kpi.accent}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts row 1: Enrollment trends + Users by role */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <p className="text-sm text-muted-foreground">
              Classes created over time (monthly)
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {enrollmentTrends.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No time series data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentTrends}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      name="Classes"
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="total"
                    nameKey="role"
                    data={usersByRole}
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell
                        key={`${entry.role}-${index}`}
                        fill={roleColors[index % roleColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {usersByRole.map((entry, index) => (
                <span
                  key={entry.role}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: roleColors[index % roleColors.length],
                    }}
                  />
                  {entry.role} · {entry.total}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: Classes by department + Capacity status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Classes by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {classesByDepartment.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No class data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classesByDepartment}>
                    <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="totalClasses"
                      name="Classes"
                      fill="#a855f7"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Capacity Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Utilised vs available seats
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-56">
              {capacityStats.totalCapacity === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No capacity data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      nameKey="name"
                      data={capacityStats.data}
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {capacityStats.data.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={capacityColors[index % capacityColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {capacityStats.enrolled} / {capacityStats.totalCapacity} seats
              filled ({utilisationRate}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights: subjects per department + classes per subject */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Subjects per Department
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectsByDepartment}>
                  <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="totalSubjects"
                    fill="#f97316"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Classes per Subject
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classesBySubject}>
                  <XAxis dataKey="subjectName" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="totalClasses"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key metrics row */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {keyMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {metric.label}
                  </p>
                  <metric.icon className={`h-4 w-4 ${metric.accent}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity feed: newest classes + newest teachers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Newest Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newestClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent classes.</p>
            )}
            {newestClasses.map((item, index) => (
              <Link
                key={item.id}
                to={`/classes/show/${item.id}`}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subject?.name ?? "No subject"} ·{" "}
                      {item.teacher?.name ?? "No teacher"}
                      {item.createdAt
                        ? ` · ${format(parseISO(item.createdAt), "MMM d, yyyy")}`
                        : ""}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">New</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Newest Teachers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newestTeachers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent teachers.
              </p>
            )}
            {newestTeachers.map((teacher, index) => (
              <Link
                key={teacher.id}
                to={`/users/show/${teacher.id}`}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.email}
                      {teacher.createdAt
                        ? ` · ${format(
                            parseISO(teacher.createdAt),
                            "MMM d, yyyy"
                          )}`
                        : ""}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">New</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top departments + top subjects */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Departments with Most Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDepartments.length === 0 && (
              <p className="text-sm text-muted-foreground">No data.</p>
            )}
            {topDepartments.map((dept, index) => (
              <div
                key={dept.departmentId}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{dept.departmentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {dept.totalSubjects} subjects
                    </p>
                  </div>
                </div>
                <Badge>{dept.totalSubjects}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Subjects with Most Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSubjects.length === 0 && (
              <p className="text-sm text-muted-foreground">No data.</p>
            )}
            {topSubjects.map((subject, index) => (
              <div
                key={subject.subjectId}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{subject.subjectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {subject.totalClasses} classes
                    </p>
                  </div>
                </div>
                <Badge>{subject.totalClasses}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator />
    </div>
  );
};

export default Dashboard;
