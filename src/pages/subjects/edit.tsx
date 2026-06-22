import { useParams } from "react-router";

import { SubjectForm } from "./create";

const SubjectsEdit = () => {
    const { id } = useParams();

    return <SubjectForm action="edit" id={id} />;
};

export default SubjectsEdit;
