import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Deterministic UUIDs so re-runs are idempotent
const MOCK_USER_IDS = [
  "a0000000-0000-0000-0000-000000000001",
  "a0000000-0000-0000-0000-000000000002",
  "a0000000-0000-0000-0000-000000000003",
  "a0000000-0000-0000-0000-000000000004",
  "a0000000-0000-0000-0000-000000000005",
  "a0000000-0000-0000-0000-000000000006",
  "a0000000-0000-0000-0000-000000000007",
  "a0000000-0000-0000-0000-000000000008",
];

const MOCK_TUTOR_IDS = [
  "b0000000-0000-0000-0000-000000000001",
  "b0000000-0000-0000-0000-000000000002",
  "b0000000-0000-0000-0000-000000000003",
  "b0000000-0000-0000-0000-000000000004",
  "b0000000-0000-0000-0000-000000000005",
  "b0000000-0000-0000-0000-000000000006",
  "b0000000-0000-0000-0000-000000000007",
  "b0000000-0000-0000-0000-000000000008",
];

const tutors = [
  {
    id: MOCK_TUTOR_IDS[0],
    user_id: MOCK_USER_IDS[0],
    first_name: "Sarah",
    last_name: "Chen",
    title: "SAT & ACT Tutor — New York & New Jersey",
    slug: "sarah-chen",
    avatar_color: "#6366f1",
    email: "sarah@example.com",
    exams: ["SAT", "ACT"],
    subjects: ["SAT Math", "ACT Science", "AP Calculus"],
    locations: ["New York City", "New Jersey", "Online"],
    links: [
      { label: "Visit sarahchen.com", url: "https://sarahchen.com", icon: "link" },
      { label: "Book a free 20-min consult", url: "https://calendly.com/sarah-chen", icon: "calendar" },
    ],
    business_name: "Chen Tutoring",
    years_experience: 6,
  },
  {
    id: MOCK_TUTOR_IDS[1],
    user_id: MOCK_USER_IDS[1],
    first_name: "Marcus",
    last_name: "Thompson",
    title: "Math & Physics Tutor — NJ & Online",
    slug: "marcus-thompson",
    avatar_color: "#8b5cf6",
    email: "marcus@example.com",
    exams: ["SAT", "AP"],
    subjects: ["SAT Math", "AP Physics", "Algebra II", "Pre-Calculus"],
    locations: ["New Jersey", "Online"],
    links: [
      { label: "Book a session", url: "https://calendly.com/marcus-t", icon: "calendar" },
    ],
    business_name: null,
    years_experience: 4,
  },
  {
    id: MOCK_TUTOR_IDS[2],
    user_id: MOCK_USER_IDS[2],
    first_name: "Rachel",
    last_name: "Kim",
    title: "SAT/ACT & AP English Tutor — NYC",
    slug: "rachel-kim",
    avatar_color: "#ec4899",
    email: "rachel@example.com",
    exams: ["SAT", "ACT"],
    subjects: ["SAT Reading", "SAT Writing", "ACT English", "AP English Literature"],
    locations: ["New York City", "Brooklyn", "Online"],
    links: [
      { label: "My website", url: "https://rachelkim-tutoring.com", icon: "link" },
      { label: "Schedule a call", url: "https://calendly.com/rachel-kim", icon: "calendar" },
      { label: "Free SAT Reading Guide", url: "https://rachelkim-tutoring.com/guide", icon: "file" },
    ],
    business_name: "Kim Test Prep",
    years_experience: 7,
  },
  {
    id: MOCK_TUTOR_IDS[3],
    user_id: MOCK_USER_IDS[3],
    first_name: "James",
    last_name: "Okafor",
    title: "STEM Tutor — Bay Area",
    slug: "james-okafor",
    avatar_color: "#14b8a6",
    email: "james@example.com",
    exams: ["AP", "SAT"],
    subjects: ["AP Chemistry", "AP Biology", "SAT Math", "Organic Chemistry"],
    locations: ["San Francisco", "Bay Area", "Online"],
    links: [
      { label: "Book with me", url: "https://calendly.com/james-okafor", icon: "calendar" },
    ],
    business_name: "Okafor STEM Academy",
    years_experience: 5,
  },
  {
    id: MOCK_TUTOR_IDS[4],
    user_id: MOCK_USER_IDS[4],
    first_name: "Anika",
    last_name: "Patel",
    title: "AP Math & Computer Science — Online",
    slug: "anika-patel",
    avatar_color: "#f59e0b",
    email: "anika@example.com",
    exams: ["AP"],
    subjects: ["AP Calculus AB", "AP Calculus BC", "AP Computer Science A", "AP Statistics"],
    locations: ["Online"],
    links: [
      { label: "My tutoring site", url: "https://anikapatel.dev", icon: "link" },
      { label: "Free AP Calc cheat sheet", url: "https://anikapatel.dev/calc-guide", icon: "file" },
    ],
    business_name: null,
    years_experience: 3,
  },
  {
    id: MOCK_TUTOR_IDS[5],
    user_id: MOCK_USER_IDS[5],
    first_name: "David",
    last_name: "Nguyen",
    title: "Test Prep & College Admissions — Los Angeles",
    slug: "david-nguyen",
    avatar_color: "#ef4444",
    email: "david@example.com",
    exams: ["SAT", "ACT"],
    subjects: ["SAT Math", "SAT Reading", "ACT Math", "College Essays"],
    locations: ["Los Angeles", "Online"],
    links: [
      { label: "Website", url: "https://davidnguyen-prep.com", icon: "link" },
      { label: "Book intro call", url: "https://calendly.com/david-nguyen", icon: "calendar" },
    ],
    business_name: "Nguyen Test Prep",
    years_experience: 8,
  },
  {
    id: MOCK_TUTOR_IDS[6],
    user_id: MOCK_USER_IDS[6],
    first_name: "Emily",
    last_name: "Rivera",
    title: "Spanish & French Tutor — Chicago & Online",
    slug: "emily-rivera",
    avatar_color: "#06b6d4",
    email: "emily@example.com",
    exams: ["AP"],
    subjects: ["AP Spanish", "AP French", "Spanish 1-4", "French 1-4"],
    locations: ["Chicago", "Online"],
    links: [
      { label: "Schedule a lesson", url: "https://calendly.com/emily-rivera", icon: "calendar" },
    ],
    business_name: null,
    years_experience: 4,
  },
  {
    id: MOCK_TUTOR_IDS[7],
    user_id: MOCK_USER_IDS[7],
    first_name: "Alex",
    last_name: "Washington",
    title: "Writing & Humanities Tutor — Online",
    slug: "alex-washington",
    avatar_color: "#a855f7",
    email: "alex@example.com",
    exams: ["SAT", "AP"],
    subjects: ["SAT Writing", "AP US History", "AP World History", "College Essays"],
    locations: ["Online"],
    links: [
      { label: "Book a session", url: "https://calendly.com/alex-washington", icon: "calendar" },
      { label: "Free essay template", url: "https://alexwrites.co/template", icon: "file" },
    ],
    business_name: "Washington Writing Lab",
    years_experience: 5,
  },
];

const vouches = [
  { voucher_tutor_id: MOCK_TUTOR_IDS[0], vouched_tutor_id: MOCK_TUTOR_IDS[1] },
  { voucher_tutor_id: MOCK_TUTOR_IDS[0], vouched_tutor_id: MOCK_TUTOR_IDS[2] },
  { voucher_tutor_id: MOCK_TUTOR_IDS[2], vouched_tutor_id: MOCK_TUTOR_IDS[0] },
  { voucher_tutor_id: MOCK_TUTOR_IDS[1], vouched_tutor_id: MOCK_TUTOR_IDS[0] },
  { voucher_tutor_id: MOCK_TUTOR_IDS[3], vouched_tutor_id: MOCK_TUTOR_IDS[4] },
  { voucher_tutor_id: MOCK_TUTOR_IDS[4], vouched_tutor_id: MOCK_TUTOR_IDS[3] },
  { voucher_tutor_id: MOCK_TUTOR_IDS[7], vouched_tutor_id: MOCK_TUTOR_IDS[2] },
];

async function createMockUsers() {
  console.log("Creating mock auth users...");
  for (let i = 0; i < MOCK_USER_IDS.length; i++) {
    const tutor = tutors[i];
    const email = `mock-${tutor.slug}@tutorcard.test`;
    const { error } = await supabase.auth.admin.createUser({
      id: MOCK_USER_IDS[i],
      email,
      password: "mock-password-123",
      email_confirm: true,
      user_metadata: { full_name: `${tutor.first_name} ${tutor.last_name}` },
    });
    if (error && !error.message.includes("already been registered")) {
      console.error(`  Failed to create user ${email}:`, error.message);
    } else {
      console.log(`  User: ${email}`);
    }
  }
}

async function seedTutors() {
  console.log("Seeding tutors...");
  const { error } = await supabase.from("tutors").upsert(tutors, { onConflict: "id" });
  if (error) {
    console.error("  Failed to seed tutors:", error.message);
    return false;
  }
  console.log(`  Inserted ${tutors.length} tutors`);
  return true;
}

async function seedVouches() {
  console.log("Seeding vouches...");
  for (const v of vouches) {
    const { error } = await supabase.from("vouches").upsert(v, {
      onConflict: "voucher_tutor_id,vouched_tutor_id",
    });
    if (error) {
      console.error(`  Failed to add vouch:`, error.message);
    }
  }
  console.log(`  Inserted ${vouches.length} vouches`);
}

async function clean() {
  console.log("Cleaning mock data...");

  console.log("  Removing vouches...");
  await supabase.from("vouches").delete().in("voucher_tutor_id", MOCK_TUTOR_IDS);

  console.log("  Removing tutors...");
  await supabase.from("tutors").delete().in("id", MOCK_TUTOR_IDS);

  console.log("  Removing auth users...");
  for (const uid of MOCK_USER_IDS) {
    const { error } = await supabase.auth.admin.deleteUser(uid);
    if (error && !error.message.includes("not found")) {
      console.error(`    Failed to delete user ${uid}:`, error.message);
    }
  }

  console.log("Clean complete.");
}

async function seed() {
  await createMockUsers();
  const tutorsOk = await seedTutors();
  if (!tutorsOk) {
    console.error("Aborting: tutors must be seeded first.");
    process.exit(1);
  }
  await seedVouches();
  console.log("\nSeed complete!");
}

const isClean = process.argv.includes("--clean");
if (isClean) {
  clean().catch(console.error);
} else {
  seed().catch(console.error);
}
