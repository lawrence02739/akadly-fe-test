export type ReviewStatus = "Published" | "Pending" | "Flagged";

export type DemoReview = {
  id: string;
  reviewer: string;
  reviewerEmail: string;
  type: "Student" | "Partner";
  source: "LMS" | "Landing page" | "Mobile app";
  rating: number;
  text: string;
  date: string;
  status: ReviewStatus;
  pageUrl: string;
};

export const reviews: DemoReview[] = [
  { id: "RV100234", reviewer: "Courtney Henry", reviewerEmail: "courtney.henry@example.com", type: "Student", source: "LMS", rating: 5, text: "The conceptual flow of the Practice Exams is outstanding. It helped me clear my exam on the first attempt.", date: "Aug 18, 2026", status: "Published", pageUrl: "/test-results" },
  { id: "RV100233", reviewer: "Acme Corp", reviewerEmail: "feedback@acme.example.com", type: "Partner", source: "Landing page", rating: 4, text: "Great dashboard and tracking facilities. Some questions need clearer explanations.", date: "Aug 17, 2026", status: "Pending", pageUrl: "/" },
  { id: "RV100232", reviewer: "Stanford Edu", reviewerEmail: "reviews@stanford.example.com", type: "Partner", source: "Landing page", rating: 5, text: "Exceptional platform. The seamless integration of video lessons and practice content is excellent.", date: "Aug 16, 2026", status: "Published", pageUrl: "/courses" },
  { id: "RV100231", reviewer: "Dianne Russell", reviewerEmail: "dianne.russell@example.com", type: "Student", source: "LMS", rating: 3, text: "The flashcards are super helpful on mobile, but I encountered a few loading issues.", date: "Aug 12, 2026", status: "Flagged", pageUrl: "/courses" },
  { id: "RV100230", reviewer: "John Doe", reviewerEmail: "john.doe@example.com", type: "Student", source: "Landing page", rating: 5, text: "Very user-friendly registration flow and clear pricing structure.", date: "Aug 09, 2026", status: "Published", pageUrl: "/pricing" },
  { id: "RV100229", reviewer: "Leslie Alexander", reviewerEmail: "leslie.alexander@example.com", type: "Student", source: "LMS", rating: 4, text: "The personalized study plan is a game changer. Kept me disciplined throughout the course.", date: "Aug 05, 2026", status: "Pending", pageUrl: "/dashboard" },
];

export const tone = {
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Pending: "bg-amber-50 text-amber-700 ring-amber-100",
  Flagged: "bg-rose-50 text-rose-700 ring-rose-100",
};
