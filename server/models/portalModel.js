const portalUsers = {
  parent: {
    role: "parent",
    username: "parent",
    password: "parent123",
    name: "Demo Parent",
    headline: "Aarohi's learning dashboard",
    profile: {
      childName: "Aarohi",
      className: "Playgroup",
      teacher: "Ms. Kavya",
      attendance: "96%",
      nextFeeDue: "10 July 2026"
    },
    dashboard: {
      summary: [
        { label: "Attendance", value: "96%" },
        { label: "Activities", value: "18" },
        { label: "Teacher Notes", value: "5" },
        { label: "Upcoming Events", value: "3" }
      ],
      notices: [
        "Bring a family photo for the classroom tree activity.",
        "Monsoon Discovery Week starts next Monday.",
        "Parent-teacher interaction slots open this Friday."
      ],
      timeline: [
        { title: "Story Circle", text: "Participated confidently during picture reading." },
        { title: "Creative Art", text: "Completed umbrella sponge painting with careful color choices." },
        { title: "Outdoor Play", text: "Practiced balance walk and group play routines." }
      ]
    }
  },
  teacher: {
    role: "teacher",
    username: "teacher",
    password: "teacher123",
    name: "Demo Teacher",
    headline: "Playgroup class dashboard",
    profile: {
      className: "Playgroup",
      students: "24",
      presentToday: "22",
      pendingNotes: "4",
      nextActivity: "Color sorting studio"
    },
    dashboard: {
      summary: [
        { label: "Students", value: "24" },
        { label: "Present Today", value: "22" },
        { label: "Parent Messages", value: "6" },
        { label: "Activity Photos", value: "12" }
      ],
      notices: [
        "Upload today's activity photos before 2 PM.",
        "Prepare rhyme cards for Friday's circle time.",
        "Review new admission settling notes."
      ],
      timeline: [
        { title: "Attendance", text: "Mark morning attendance and update absent notes." },
        { title: "Learning Plan", text: "Run color sorting, story cards, and movement games." },
        { title: "Parent Updates", text: "Share individual observations for settling children." }
      ]
    }
  }
};

export function loginPortalUser(role, username, password) {
  const user = portalUsers[role];

  if (!user || user.username !== username || user.password !== password) {
    return null;
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function getPortalDemoCredentials() {
  return {
    parent: { username: portalUsers.parent.username, password: portalUsers.parent.password },
    teacher: { username: portalUsers.teacher.username, password: portalUsers.teacher.password }
  };
}
