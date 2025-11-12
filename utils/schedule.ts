export type Freq = 'daily' | 'weekly' | 'monthly';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDayLocal(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetweenLocal(a: Date, b: Date) {
  return Math.round(
    (startOfDayLocal(b).getTime() - startOfDayLocal(a).getTime()) / MS_PER_DAY
  );
}

// e.g., createdAt=Jan 31 -> due on Feb 29/28, Apr 30, etc.
function monthlyDueDayThisMonth(created: Date, onDate: Date) {
  const createdDay = created.getDate();
  const lastDayThisMonth = new Date(
    onDate.getFullYear(),
    onDate.getMonth() + 1,
    0
  ).getDate();
  return Math.min(createdDay, lastDayThisMonth);
}

/**
 * Decide if the goal is "live" on `onDate` based on its frequency and createdAt anchor.
 * - daily: live every day
 * - weekly: live on the same weekday as createdAt  (ALT: every 7 days from createdAt;)
 * - monthly: live on the same day-of-month as createdAt (clamped to month length)
 */
export function isLiveForDateByCreatedAt(
  frequency: Freq,
  createdAtISO: string | Date,
  onDate: Date = new Date()
): boolean {
  const created = startOfDayLocal(new Date(createdAtISO));
  const today = startOfDayLocal(onDate);

  switch (frequency) {
    case 'daily':
      return true;

    case 'weekly': {
      // mathematical 7-day cadence
      const d = daysBetweenLocal(created, today);
      return d >= 0 && d % 7 === 0;
    }

    case 'monthly': {
      return today.getDate() === monthlyDueDayThisMonth(created, today);
    }

    default:
      return true;
  }
}

/** (Optional) Compute the next due date from a given date, useful for previews/UI */
export function nextDueDateByCreatedAt(
  frequency: Freq,
  createdAtISO: string | Date,
  from: Date = new Date()
): Date {
  const fromStart = startOfDayLocal(from);
  const created = startOfDayLocal(new Date(createdAtISO));

  if (frequency === 'daily') {
    return new Date(
      fromStart.getFullYear(),
      fromStart.getMonth(),
      fromStart.getDate() + 1
    );
  }

  if (frequency === 'weekly') {
    // Next occurrence of the createdAt weekday
    const targetDow = created.getDay();
    const curDow = fromStart.getDay();
    const delta = (targetDow - curDow + 7) % 7 || 7;
    return new Date(
      fromStart.getFullYear(),
      fromStart.getMonth(),
      fromStart.getDate() + delta
    );
  }

  // monthly
  const createdDay = created.getDate();
  const y = fromStart.getFullYear();
  const m = fromStart.getMonth();

  // If today is already the monthly due day, advance to next month
  const dueToday =
    fromStart.getDate() === monthlyDueDayThisMonth(created, fromStart);
  const nextMonth = dueToday
    ? m + 1
    : m +
      (fromStart.getDate() > monthlyDueDayThisMonth(created, fromStart)
        ? 1
        : 0);

  const lastDayNextMonth = new Date(y, nextMonth + 1, 0).getDate();
  const targetDay = Math.min(createdDay, lastDayNextMonth);
  return new Date(y, nextMonth, targetDay);
}
