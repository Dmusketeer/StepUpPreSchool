const erpModules = [
  {
    key: "students",
    label: "Student Management",
    description: "Maintain student profiles, admission details, guardian contacts, class allocation, and documents.",
    roles: ["admin", "teacher", "parent"],
    roleDescriptions: {
      admin: "Create and manage all student records and admissions.",
      teacher: "View assigned class students and learning notes.",
      parent: "View child profile, class, teacher, and school details."
    },
    metrics: [
      { label: "Students", value: "128" },
      { label: "New Admissions", value: "14" }
    ]
  },
  {
    key: "attendance",
    label: "Attendance",
    description: "Track daily attendance, late arrivals, absences, and monthly attendance reports.",
    roles: ["admin", "teacher", "parent"],
    roleDescriptions: {
      admin: "Monitor attendance across all classes.",
      teacher: "Mark and update attendance for assigned students.",
      parent: "Check child attendance and absence history."
    },
    metrics: [
      { label: "Present Today", value: "116" },
      { label: "Absent", value: "12" }
    ]
  },
  {
    key: "fees",
    label: "Fees",
    description: "Manage fee plans, due dates, paid receipts, concessions, and pending dues.",
    roles: ["admin", "parent"],
    roleDescriptions: {
      admin: "Create fee schedules, track collections, and review dues.",
      parent: "View fee dues, paid receipts, and next due date."
    },
    metrics: [
      { label: "Collected", value: "82%" },
      { label: "Due This Month", value: "18" }
    ]
  },
  {
    key: "homework",
    label: "Homework",
    description: "Assign activities, classwork practice, rhymes, reading tasks, and parent follow-up notes.",
    roles: ["admin", "teacher", "parent"],
    roleDescriptions: {
      admin: "Review homework activity consistency across classes.",
      teacher: "Create and share homework or practice tasks.",
      parent: "View child homework and activity instructions."
    },
    metrics: [
      { label: "Active Tasks", value: "9" },
      { label: "Completed", value: "74%" }
    ]
  },
  {
    key: "exams",
    label: "Exams and Results",
    description: "Plan assessments, record observations, publish progress reports, and track milestones.",
    roles: ["admin", "teacher", "parent"],
    roleDescriptions: {
      admin: "Configure terms, assessments, and progress report formats.",
      teacher: "Enter observations and assessment outcomes.",
      parent: "View progress reports and milestone feedback."
    },
    metrics: [
      { label: "Assessments", value: "6" },
      { label: "Reports Ready", value: "41" }
    ]
  },
  {
    key: "transport",
    label: "Transport",
    description: "Manage routes, pickup points, vehicle details, drivers, and child transport allocation.",
    roles: ["admin", "parent"],
    roleDescriptions: {
      admin: "Manage vehicles, routes, drivers, and transport assignments.",
      parent: "View child route, pickup point, and driver contact."
    },
    metrics: [
      { label: "Routes", value: "5" },
      { label: "Transport Students", value: "48" }
    ]
  },
  {
    key: "staff",
    label: "Staff",
    description: "Maintain staff profiles, roles, attendance, assignments, and internal responsibilities.",
    roles: ["admin"],
    roleDescriptions: {
      admin: "Manage teachers, helpers, staff attendance, and class responsibilities."
    },
    metrics: [
      { label: "Staff", value: "18" },
      { label: "Teachers", value: "9" }
    ]
  },
  {
    key: "communication",
    label: "Parent Communication",
    description: "Send notices, reminders, activity updates, parent messages, and school announcements.",
    roles: ["admin", "teacher", "parent"],
    roleDescriptions: {
      admin: "Broadcast school-wide notices and admission updates.",
      teacher: "Send class updates, activity photos, and individual notes.",
      parent: "Receive notices, teacher notes, reminders, and announcements."
    },
    metrics: [
      { label: "Messages", value: "36" },
      { label: "Notices", value: "8" }
    ]
  }
];

const roleDashboards = {
  parent: {
    title: "Parent ERP Access",
    subtitle: "Focused access for child progress, payments, transport, homework, and school updates.",
    summary: [
      { label: "Accessible Modules", value: "7" },
      { label: "Pending Fees", value: "1" },
      { label: "Homework", value: "3" },
      { label: "Unread Notices", value: "4" }
    ],
    quickActions: ["View child profile", "Check attendance", "Review fee due date", "Read teacher messages"]
  },
  teacher: {
    title: "Teacher ERP Access",
    subtitle: "Classroom tools for students, attendance, homework, assessment notes, and parent communication.",
    summary: [
      { label: "Accessible Modules", value: "5" },
      { label: "Class Students", value: "24" },
      { label: "Attendance Pending", value: "1" },
      { label: "Parent Messages", value: "6" }
    ],
    quickActions: ["Mark attendance", "Post homework", "Update observations", "Send class notice"]
  },
  admin: {
    title: "Admin ERP Access",
    subtitle: "Complete school operations access for students, staff, fees, academics, transport, and communication.",
    summary: [
      { label: "Accessible Modules", value: "8" },
      { label: "Students", value: "128" },
      { label: "Staff", value: "18" },
      { label: "Fee Collection", value: "82%" }
    ],
    quickActions: ["Manage admissions", "Review dues", "Assign transport", "Broadcast notice"]
  }
};

export function getAllErpModules() {
  return erpModules.map(normalizeModule);
}

export function getErpModulesForRole(role) {
  return erpModules.filter((module) => module.roles.includes(role)).map((module) => normalizeModule(module, role));
}

export function getErpDashboardForRole(role) {
  const dashboard = roleDashboards[role];

  if (!dashboard) {
    return null;
  }

  return {
    role,
    ...dashboard,
    modules: getErpModulesForRole(role)
  };
}

export function getErpRoles() {
  return Object.keys(roleDashboards);
}

function normalizeModule(module, role) {
  return {
    key: module.key,
    label: module.label,
    description: module.description,
    roles: module.roles,
    roleDescription: role ? module.roleDescriptions[role] : null,
    metrics: module.metrics
  };
}