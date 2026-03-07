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

const MOCK_COMMUNITY_IDS = [
  "c0000000-0000-0000-0000-000000000001",
  "c0000000-0000-0000-0000-000000000002",
  "c0000000-0000-0000-0000-000000000003",
];

const MOCK_REFERRAL_IDS = [
  "d0000000-0000-0000-0000-000000000001",
  "d0000000-0000-0000-0000-000000000002",
  "d0000000-0000-0000-0000-000000000003",
  "d0000000-0000-0000-0000-000000000004",
  "d0000000-0000-0000-0000-000000000005",
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
    open_to_referrals: true,
    notify_on_match: true,
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
    open_to_referrals: true,
    notify_on_match: true,
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
    open_to_referrals: true,
    notify_on_match: true,
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
    open_to_referrals: true,
    notify_on_match: true,
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
    open_to_referrals: true,
    notify_on_match: true,
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
    open_to_referrals: true,
    notify_on_match: false,
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
    open_to_referrals: false,
    notify_on_match: true,
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
    open_to_referrals: true,
    notify_on_match: true,
    business_name: "Washington Writing Lab",
    years_experience: 5,
  },
];

const communities = [
  {
    id: MOCK_COMMUNITY_IDS[0],
    name: "NYC SAT/ACT Tutors",
    description:
      "A community for SAT and ACT tutors in the New York City metro area. Share referrals, resources, and connect with fellow test prep professionals.",
    avatar_color: "#6366f1",
    created_by: MOCK_TUTOR_IDS[0], // Sarah Chen
    is_public: true,
    require_approval: true,
    application_questions: ["What subjects and exams do you tutor?", "How long have you been tutoring in NYC?"],
  },
  {
    id: MOCK_COMMUNITY_IDS[1],
    name: "Bay Area STEM Tutors",
    description:
      "STEM tutors across the San Francisco Bay Area. Referrals for math, science, and CS students.",
    avatar_color: "#14b8a6",
    created_by: MOCK_TUTOR_IDS[3], // James Okafor
    is_public: true,
    require_approval: false,
  },
  {
    id: MOCK_COMMUNITY_IDS[2],
    name: "Online AP Tutors Network",
    description:
      "AP tutors who teach online. All AP subjects welcome. Post and claim referrals for AP students nationwide.",
    avatar_color: "#f59e0b",
    created_by: MOCK_TUTOR_IDS[4], // Anika Patel
    is_public: true,
    require_approval: true,
  },
];

// Community memberships: owner + a few members each
const communityMembers = [
  // NYC SAT/ACT Tutors — Sarah (owner), Marcus, Rachel
  { community_id: MOCK_COMMUNITY_IDS[0], tutor_id: MOCK_TUTOR_IDS[0], role: "owner" },
  { community_id: MOCK_COMMUNITY_IDS[0], tutor_id: MOCK_TUTOR_IDS[1], role: "member" },
  { community_id: MOCK_COMMUNITY_IDS[0], tutor_id: MOCK_TUTOR_IDS[2], role: "member" },
  // Bay Area STEM — James (owner), Anika
  { community_id: MOCK_COMMUNITY_IDS[1], tutor_id: MOCK_TUTOR_IDS[3], role: "owner" },
  { community_id: MOCK_COMMUNITY_IDS[1], tutor_id: MOCK_TUTOR_IDS[4], role: "member" },
  // Online AP Network — Anika (owner), Alex, Rachel, Emily
  { community_id: MOCK_COMMUNITY_IDS[2], tutor_id: MOCK_TUTOR_IDS[4], role: "owner" },
  { community_id: MOCK_COMMUNITY_IDS[2], tutor_id: MOCK_TUTOR_IDS[7], role: "member" },
  { community_id: MOCK_COMMUNITY_IDS[2], tutor_id: MOCK_TUTOR_IDS[2], role: "member" },
  { community_id: MOCK_COMMUNITY_IDS[2], tutor_id: MOCK_TUTOR_IDS[6], role: "member" },
];

const referrals = [
  {
    id: MOCK_REFERRAL_IDS[0],
    tutor_id: MOCK_TUTOR_IDS[0], // Sarah
    community_id: MOCK_COMMUNITY_IDS[0],
    subject: "SAT Math",
    location: "New Jersey",
    grade_level: "10th grade",
    notes: "Student needs help bringing score from 650 to 750+. Prefers in-person in northern NJ.",
    message: "Student's name is Alex, parent contact: parent@example.com",
    status: "active",
  },
  {
    id: MOCK_REFERRAL_IDS[1],
    tutor_id: MOCK_TUTOR_IDS[2], // Rachel
    community_id: MOCK_COMMUNITY_IDS[0],
    subject: "ACT English",
    location: "Brooklyn",
    grade_level: "11th grade",
    notes: "Student is aiming for 34+ on ACT English. Available weekday evenings.",
    message: "",
    status: "active",
  },
  {
    id: MOCK_REFERRAL_IDS[2],
    tutor_id: MOCK_TUTOR_IDS[3], // James
    community_id: MOCK_COMMUNITY_IDS[1],
    subject: "AP Chemistry",
    location: "Bay Area",
    grade_level: "11th grade",
    notes: "Student struggling with stoichiometry and equilibrium. Exam in May.",
    message: "",
    status: "active",
  },
  {
    id: MOCK_REFERRAL_IDS[3],
    tutor_id: MOCK_TUTOR_IDS[4], // Anika
    community_id: MOCK_COMMUNITY_IDS[2],
    subject: "AP Calculus BC",
    location: "Online",
    grade_level: "12th grade",
    notes: "Student needs help with series and sequences unit. Looking for 2x/week sessions.",
    message: "Student prefers evenings after 6pm EST.",
    status: "active",
  },
  {
    id: MOCK_REFERRAL_IDS[4],
    tutor_id: MOCK_TUTOR_IDS[5], // David
    community_id: null,
    subject: "SAT Reading",
    location: "Los Angeles",
    grade_level: "10th grade",
    notes: "Student just moved to LA, looking for in-person SAT reading tutor. Currently scoring around 600.",
    message: "",
    status: "active",
  },
];

const vouches = [
  { voucher_tutor_id: MOCK_TUTOR_IDS[0], vouched_tutor_id: MOCK_TUTOR_IDS[1] }, // Sarah vouches for Marcus
  { voucher_tutor_id: MOCK_TUTOR_IDS[0], vouched_tutor_id: MOCK_TUTOR_IDS[2] }, // Sarah vouches for Rachel
  { voucher_tutor_id: MOCK_TUTOR_IDS[2], vouched_tutor_id: MOCK_TUTOR_IDS[0] }, // Rachel vouches for Sarah
  { voucher_tutor_id: MOCK_TUTOR_IDS[1], vouched_tutor_id: MOCK_TUTOR_IDS[0] }, // Marcus vouches for Sarah
  { voucher_tutor_id: MOCK_TUTOR_IDS[3], vouched_tutor_id: MOCK_TUTOR_IDS[4] }, // James vouches for Anika
  { voucher_tutor_id: MOCK_TUTOR_IDS[4], vouched_tutor_id: MOCK_TUTOR_IDS[3] }, // Anika vouches for James
  { voucher_tutor_id: MOCK_TUTOR_IDS[7], vouched_tutor_id: MOCK_TUTOR_IDS[2] }, // Alex vouches for Rachel
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

async function seedCommunities() {
  console.log("Seeding communities...");
  const { error } = await supabase.from("communities").upsert(communities, { onConflict: "id" });
  if (error) {
    console.error("  Failed to seed communities:", error.message);
    return false;
  }
  console.log(`  Inserted ${communities.length} communities`);
  return true;
}

async function seedCommunityMembers() {
  console.log("Seeding community memberships...");
  for (const m of communityMembers) {
    const { error } = await supabase.from("community_members").upsert(m, {
      onConflict: "community_id,tutor_id",
    });
    if (error) {
      console.error(`  Failed to add member ${m.tutor_id} to ${m.community_id}:`, error.message);
    }
  }
  console.log(`  Inserted ${communityMembers.length} memberships`);
}

async function seedReferrals() {
  console.log("Seeding referrals (opportunities)...");
  const { error } = await supabase.from("referrals").upsert(referrals, { onConflict: "id" });
  if (error) {
    console.error("  Failed to seed referrals:", error.message);
    return;
  }
  console.log(`  Inserted ${referrals.length} referrals`);
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

  // Delete in reverse dependency order
  console.log("  Removing vouches...");
  await supabase.from("vouches").delete().in("voucher_tutor_id", MOCK_TUTOR_IDS);

  console.log("  Removing referrals...");
  await supabase.from("referrals").delete().in("id", MOCK_REFERRAL_IDS);

  console.log("  Removing community members...");
  await supabase.from("community_members").delete().in("tutor_id", MOCK_TUTOR_IDS);

  console.log("  Removing communities...");
  await supabase.from("communities").delete().in("id", MOCK_COMMUNITY_IDS);

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
    console.error("Aborting: tutors must be seeded before communities/referrals.");
    process.exit(1);
  }
  const communitiesOk = await seedCommunities();
  if (communitiesOk) {
    await seedCommunityMembers();
  }
  await seedReferrals();
  await seedVouches();
  console.log("\nSeed complete!");
}

const isClean = process.argv.includes("--clean");
if (isClean) {
  clean().catch(console.error);
} else {
  seed().catch(console.error);
}
