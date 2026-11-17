import { MENU_DAYS } from "@/lib/menu-days"

type MenuDaySelectProps = {
  id: string
  defaultValue?: string | null
}

export function MenuDaySelect({ id, defaultValue = null }: MenuDaySelectProps) {
  return (
    <div className="field">
      <label htmlFor={id}>Menu day</label>
      <select id={id} name="menuDay" defaultValue={defaultValue ?? ""}>
        <option value="">Every day</option>
        {MENU_DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
      </select>
    </div>
  )
}
