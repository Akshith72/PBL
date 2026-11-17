export const MENU_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const

export type MenuDay = (typeof MENU_DAYS)[number]

export function getCurrentMenuDay(date = new Date()): MenuDay {
  const currentDay = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).format(date)

  return MENU_DAYS.includes(currentDay as MenuDay) ? (currentDay as MenuDay) : "Monday"
}
