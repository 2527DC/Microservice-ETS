import express from "express";
const router = express.Router();

// Static employee data (mock)
const employees = [
  {
    id: 1,
    tenantId: "T001",
    name: "Alice Johnson",
    department: "Finance",
    email: "alice@example.com",
    phone: "9876543210",
    shift: "Morning",
  },
  {
    id: 2,
    tenantId: "T001",
    name: "Bob Smith",
    department: "HR",
    email: "bob@example.com",
    phone: "9876501234",
    shift: "Evening",
  },
  {
    id: 3,
    tenantId: "T002",
    name: "Charlie Brown",
    department: "Operations",
    email: "charlie@example.com",
    phone: "9876567890",
    shift: "Night",
  },
];

// GET all employees
router.get("/employees", (req, res) => {
  res.json({
    success: true,
    message: "Employee list fetched successfully (static)",
    data: employees,
  });
});

// GET employee by ID
router.get("/employees/:id", (req, res) => {
  const employee = employees.find((emp) => emp.id === Number(req.params.id));

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "Employee not found",
    });
  }

  res.json({
    success: true,
    message: "Employee details fetched successfully (static)",
    data: employee,
  });
});

export default router;
