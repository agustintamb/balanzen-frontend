import type { Publication } from "@/api/publications/publications.types";

export const sortPublications = (
  pubs: Publication[],
  sort: "recent" | "oldest",
): Publication[] => {
  if (sort === "oldest") {
    return [...pubs].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }
  return [...pubs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};

export const filterPublications = (
  pubs: Publication[],
  activeFilter: string,
): Publication[] => {
  if (activeFilter !== "CANCELLED") return pubs;
  return pubs.filter((p) => p.status === "CANCELLED" || p.status === "EXPIRED");
};

export const searchPublications = (
  pubs: Publication[],
  query: string,
): Publication[] => {
  if (!query) return pubs;
  const q = query.toLowerCase();
  return pubs.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
};

export const countExpiringPublications = (
  pubs: Publication[] | undefined,
): number => {
  if (!pubs) return 0;
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDayAfterTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 2,
  );

  return pubs.filter((p) => {
    if (!p.expiry_date) return false;
    const expiry = new Date(p.expiry_date);
    return expiry >= startOfToday && expiry < startOfDayAfterTomorrow;
  }).length;
};
