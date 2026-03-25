export interface TableGroup {
  name: string;
  icon: string;
  tables: { key: string; label: string }[];
}

export const TABLE_GROUPS: TableGroup[] = [
  {
    name: "Core",
    icon: "\u{1F9E0}",
    tables: [{ key: "thoughts", label: "Thoughts" }],
  },
  {
    name: "Household",
    icon: "\u{1F3E0}",
    tables: [
      { key: "household_items", label: "Items" },
      { key: "household_vendors", label: "Vendors" },
    ],
  },
  {
    name: "Maintenance",
    icon: "\u{1F527}",
    tables: [
      { key: "maintenance_tasks", label: "Tasks" },
      { key: "maintenance_logs", label: "Logs" },
    ],
  },
  {
    name: "Calendar",
    icon: "\u{1F4C5}",
    tables: [
      { key: "family_members", label: "Family Members" },
      { key: "activities", label: "Activities" },
      { key: "important_dates", label: "Important Dates" },
    ],
  },
  {
    name: "Meals",
    icon: "\u{1F37D}\u{FE0F}",
    tables: [
      { key: "recipes", label: "Recipes" },
      { key: "meal_plans", label: "Meal Plans" },
      { key: "shopping_lists", label: "Shopping Lists" },
    ],
  },
  {
    name: "CRM",
    icon: "\u{1F4BC}",
    tables: [
      { key: "professional_contacts", label: "Contacts" },
      { key: "contact_interactions", label: "Interactions" },
      { key: "opportunities", label: "Opportunities" },
    ],
  },
  {
    name: "Job Hunt",
    icon: "\u{1F3AF}",
    tables: [
      { key: "companies", label: "Companies" },
      { key: "job_postings", label: "Postings" },
      { key: "applications", label: "Applications" },
      { key: "interviews", label: "Interviews" },
      { key: "job_contacts", label: "Contacts" },
    ],
  },
];

export const HIDDEN_COLUMNS = ["embedding"];

export const PAGE_SIZE = 25;
