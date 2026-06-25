const image = (id, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const schoolData = {
  hero: {
    kicker: "Playway preschool admissions open",
    title: "StepUp Pre School",
    subtitle:
      "A joyful early learning home where children grow through play, stories, music, movement, art, and caring routines.",
    image: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEqmwqV2MsGDRZWu4a1p-gXZRp0SpszqmaMoPAQr4AAzx6JMw5CmeyAVfRIBCenqwNJtJtSuVQnpxaGInBGZUTuvxKBu4pxbC_bSLQN0V0XuSLd88jRD9j_wmP_LKUnTMyi5VUXl2ajEl2H=s1360-w1360-h1020-rw"
  },
  stats: [
    { value: "12:1", label: "Child teacher ratio" },
    { value: "4", label: "Age-wise programs" },
    { value: "8+", label: "Activity zones" },
    { value: "100%", label: "Playway approach" }
  ],
  about: {
    title: "A warm first school experience for curious children",
    text:
      "StepUp Pre School supports every child with a safe campus, cheerful classrooms, trained educators, and child-led activities that build language, motor skills, confidence, and social habits.",
    image: image("photo-1587654780291-39c9404d746b", 1200),
    highlights: [
      "Play-based curriculum with daily storytelling, music, art, and movement",
      "Safe, hygienic, child-friendly classrooms and activity spaces",
      "Regular parent updates, observation notes, and celebration days",
      "School readiness through routines, language, numbers, and social play"
    ]
  },
  programs: [
    {
      title: "Playgroup",
      ageGroup: "2 to 3 years",
      icon: "baby",
      description:
        "Hands-on discovery through colors, shapes, pretend play, story circles, and movement games."
    },
    {
      title: "Nursery",
      ageGroup: "3 to 4.5 years",
      icon: "palette",
      description:
        "Language building, early numeracy, creative projects, rhymes, and guided peer interaction."
    },
    {
      title: "Lower KG",
      ageGroup: "4 to 5.5 years",
      icon: "book",
      description:
        "Early literacy, writing readiness, number concepts, stories, and confident classroom routines."
    },
    {
      title: "Upper KG",
      ageGroup: "5 to 6 years",
      icon: "sprout",
      description:
        "School readiness with phonics, number sense, writing practice, confidence, and presentation skills."
    }
  ],
  whyStepUp: [
    {
      title: "Caring Teachers",
      icon: "heart",
      text: "Educators know each child by name, pace, comfort level, and learning style."
    },
    {
      title: "Creative Learning",
      icon: "sparkles",
      text: "Daily activities use art, stories, music, nature, and pretend play to make concepts real."
    },
    {
      title: "Safe Campus",
      icon: "shield",
      text: "Clean classrooms, supervised transitions, secure entry, and child-sized materials support safety."
    },
    {
      title: "Happy Confidence",
      icon: "smile",
      text: "Children learn to share, speak, listen, try again, and celebrate small wins."
    }
  ],
  dailyRhythm: [
    {
      time: "09:00 AM",
      activity: "Welcome Circle",
      description: "Greetings, songs, weather talk, and a calm start with teachers."
    },
    {
      time: "09:35 AM",
      activity: "Concept Play",
      description: "Hands-on language, number, color, shape, or theme exploration."
    },
    {
      time: "10:20 AM",
      activity: "Snack and Social Time",
      description: "Healthy food habits, conversation, sharing, and independence."
    },
    {
      time: "10:55 AM",
      activity: "Outdoor and Movement",
      description: "Gross motor games, balance, coordination, music, and free play."
    },
    {
      time: "11:35 AM",
      activity: "Story and Reflection",
      description: "Picture books, recap, goodbye routine, and parent handover."
    }
  ],
  admissions: [
    {
      title: "Book a Campus Visit",
      text: "Share your details through the enquiry form and choose a convenient visit time."
    },
    {
      title: "Meet the Team",
      text: "Tour classrooms, discuss your child, and understand the playway curriculum."
    },
    {
      title: "Start the Journey",
      text: "Complete admission details and begin with a friendly settling-in plan."
    }
  ],
  fees: {
    note: "Final fees are confirmed after campus visit and admission counselling.",
    items: [
      { title: "Admission Kit", amount: "Contact school", description: "Registration guidance, starter kit, and admission support." },
      { title: "Monthly Tuition", amount: "Program wise", description: "Age-wise playway learning, classroom activities, and regular parent updates." },
      { title: "Transport", amount: "Optional", description: "Available on selected routes after address confirmation." }
    ]
  },
  brochure: {
    title: "StepUp Pre School Brochure",
    description: "Download a quick parent handout with programs, timings, facilities, contact details, and admission steps."
  },
  gallery: [
    {
      title: "Story Corner",
      category: "Classroom",
      alt: "Children listening during story time",
      image: image("photo-1509062522246-3755977927d7", 900)
    },
    {
      title: "Creative Art",
      category: "Art Activities",
      alt: "Preschool children painting and making art",
      image: image("photo-1567057419565-4349c49d8a04", 900)
    },
    {
      title: "Activity Tables",
      category: "Classroom",
      alt: "Children working with classroom activity materials",
      image: image("photo-1588072432836-e10032774350", 900)
    },
    {
      title: "Outdoor Play",
      category: "Outdoor Play",
      alt: "Young children playing outside at school",
      image: image("photo-1544776193-352d25ca82cd", 900)
    },
    {
      title: "Music and Movement",
      category: "Events",
      alt: "Children enjoying music and movement class",
      image: image("photo-1604881991720-f91add269bed", 900)
    },
    {
      title: "Celebration Days",
      category: "Celebrations",
      alt: "Preschool celebration with colorful classroom activities",
      image: image("photo-1519340241574-2cec6aef0c01", 900)
    }
  ],
  galleryCategories: ["Classroom", "Events", "Outdoor Play", "Art Activities", "Celebrations"],
  events: [
    {
      date: "Jul 12",
      title: "Open House Morning",
      description: "Meet teachers, visit classrooms, and explore the playway learning zones."
    },
    {
      date: "Aug 03",
      title: "Monsoon Discovery Week",
      description: "Nature stories, sensory bins, umbrella art, and rain rhythm activities."
    },
    {
      date: "Sep 18",
      title: "Grandparents Day",
      description: "Songs, storytelling, keepsake crafts, and classroom moments with families."
    }
  ],
  notices: [
    { title: "Admissions Open", date: "Now", text: "Campus visits and new admissions are open for all preschool programs." },
    { title: "Parent Orientation", date: "Every Saturday", text: "Meet the team and understand class routines, safety practices, and school readiness goals." }
  ],
  teachers: [
    {
      name: "Anita Sharma",
      role: "Playgroup Mentor",
      experience: "8 years",
      image: image("photo-1494790108377-be9c29b29330", 700),
      bio: "Creates calm settling routines, story circles, and sensory play for first-time learners."
    },
    {
      name: "Priya Verma",
      role: "Nursery Teacher",
      experience: "6 years",
      image: image("photo-1580894732444-8ecded7900cd", 700),
      bio: "Builds early language, rhythm, art, and social confidence through guided play."
    },
    {
      name: "Nisha Kapoor",
      role: "Kindergarten Lead",
      experience: "9 years",
      image: image("photo-1573496359142-b8d87734a5a2", 700),
      bio: "Supports phonics, number readiness, writing habits, and presentation confidence."
    }
  ],
  testimonials: [
    {
      name: "Riya Sharma",
      role: "Parent of Nursery child",
      rating: 5,
      quote:
        "My daughter became more expressive within weeks. The teachers are warm and the updates are very reassuring."
    },
    {
      name: "Aman Verma",
      role: "Parent of Playgroup child",
      rating: 5,
      quote:
        "StepUp feels safe, clean, and cheerful. Our son loves the story corner and outdoor play time."
    },
    {
      name: "Neha Kapoor",
      role: "Parent of Kindergarten child",
      rating: 5,
      quote:
        "The school balances play and readiness beautifully. We can see confidence, manners, and curiosity growing."
    }
  ],
  faqs: [
    { question: "What age groups can apply?", answer: "Children from Playgroup to Upper KG can apply. The team guides parents to the right program by age and readiness." },
    { question: "How can parents book a campus visit?", answer: "Parents can submit the enquiry or admission form, call the school, or use WhatsApp for a quick visit request." },
    { question: "Is transport available?", answer: "Transport is optional and depends on the route. Share your address during admission counselling for confirmation." },
    { question: "How does the school update parents?", answer: "Teachers share regular updates about attendance, activities, observations, and school notices." },
    { question: "What documents are usually required?", answer: "Birth certificate, child photos, parent ID proof, address proof, and previous school details if applicable." }
  ],
  map: {
    embedUrl: "https://www.google.com/maps?q=StepUp%20Pre%20School%20Kasia%20Kushinagar&output=embed",
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=StepUp%20Pre%20School%20Kasia%20Kushinagar"
  },
  contact: {
    phone: "+918887867016",
    email: "admissions@stepuppreschool.in",
    address: "Beside New Sabji Mandi, Padarauna Road, Kasia, Kushinagar 274402, Uttar Pradesh, India",
    hours: "Monday to Saturday, 8:30 AM to 12:30 PM"
  },
  socialLinks: {
    googleBusiness: "https://www.google.com/search?q=StepUp+Pre+School+Kasia+Kushinagar",
    facebook: "https://www.facebook.com/search/top?q=StepUp%20Pre%20School%20Kasia",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/results?search_query=StepUp+Pre+School+Kasia"
  }
};

export default schoolData;
