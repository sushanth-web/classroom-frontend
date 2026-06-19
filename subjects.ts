export interface Subject {
  id: number;
  code: string;
  name: string;
  department: string;
  description: string;
  createdAt: string;
}

export const mock_subjects: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "Computer Science",
    description:
      "Foundational concepts of programming, algorithms, and computational thinking using a high-level language.",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    code: "MATH204",
    name: "Linear Algebra",
    department: "Mathematics",
    description:
      "Study of vector spaces, matrices, linear transformations, eigenvalues, and their applications.",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    code: "PSY110",
    name: "Introduction to Psychology",
    department: "Psychology",
    description:
      "Survey of human behavior and mental processes, covering cognition, development, and social psychology.",
    createdAt: new Date().toISOString()
  },
];
