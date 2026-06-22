import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useBack, type BaseRecord, type HttpError } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import * as z from "zod";

import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { departmentSchema } from "@/lib/schema";

type DepartmentFormValues = z.infer<typeof departmentSchema>;

type DepartmentFormProps = {
    action?: "create" | "edit";
    id?: string;
};

export const DepartmentForm = ({
    action = "create",
    id,
}: DepartmentFormProps) => {
    const back = useBack();

    const form = useForm<BaseRecord, HttpError, DepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        refineCoreProps: {
            resource: "departments",
            action,
            id,
        },
        defaultValues: {
            code: "",
            name: "",
            description: "",
        },
    });

    const {
        refineCore: { onFinish },
        handleSubmit,
        formState: { isSubmitting },
        control,
    } = form;

    const onSubmit = async (values: DepartmentFormValues) => {
        try {
            await onFinish(values);
        } catch (error) {
            console.error("Error saving department:", error);
        }
    };

    const isEdit = action === "edit";

    return (
        <CreateView className="class-view">
            <Breadcrumb />

            <h1 className="page-title">
                {isEdit ? "Edit Department" : "Create a Department"}
            </h1>
            <div className="intro-row">
                <p>
                    Provide the required information below to{" "}
                    {isEdit ? "update" : "add"} a department.
                </p>
                <Button onClick={() => back()}>Go Back</Button>
            </div>

            <Separator />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl pb-0 font-bold">
                            Fill out the form
                        </CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="mt-7">
                        <Form {...form}>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                <FormField
                                    control={control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Department Code{" "}
                                                <span className="text-orange-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="CS" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Department Name{" "}
                                                <span className="text-orange-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Computer Science" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description{" "}
                                                <span className="text-orange-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the department focus..."
                                                    className="min-h-28"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex gap-1 items-center">
                                            <span>{isEdit ? "Saving..." : "Creating..."}</span>
                                            <Loader2 className="inline-block ml-2 animate-spin" />
                                        </div>
                                    ) : isEdit ? (
                                        "Save Changes"
                                    ) : (
                                        "Create Department"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    );
};

const DepartmentsCreate = () => {
    return <DepartmentForm action="create" />;
};

export default DepartmentsCreate;
