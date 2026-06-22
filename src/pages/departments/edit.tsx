import { useParams } from "react-router";

import { DepartmentForm } from "./create";

const DepartmentsEdit = () => {
    const { id } = useParams();

    return <DepartmentForm action="edit" id={id} />;
};

export default DepartmentsEdit;
