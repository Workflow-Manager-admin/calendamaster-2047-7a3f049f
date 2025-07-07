import React from "react";

/**
 * PUBLIC_INTERFACE
 * WeekView calendar component with day columns, time rows, and event slots.
 * Props:
 *   days: Array of day objects { date: "2025-03-24", label: "Mon", isToday: bool }
 *   startHour: integer (e.g., 7)
 *   endHour: integer (e.g., 20)
 *   events: list of { id, title, start, end, category, calendar_id }
 *   onEventClick: fn(event)
 *   onSlotDoubleClick: fn(dateTime)
 *   categoryColors: map calendar_id and category name -> color
 */
const timeLabels = (startHour = 7, endHour = 20) => {
  const times = [];
  for (let h = startHour; h <= endHour; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
    times.push(`${String(h).padStart(2, "0")}:30`);
  }
  return times.slice(0, -1); // remove last half-hour for endHour
};

function eventsForDay(events, day) {
  // Returns events whose start falls on this day
  return events.filter(e => e.start.slice(0, 10) === day.date);
}

function getTimeSlot(date, hour, min) {
  return `${date}T${String(hour).padStart(2, "0")}:${min ? "30" : "00"}`;
}

function getPosForEvent(event, startHour) {
  // Returns [rowIndex, rowSpan] for positioning; assumes local time
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startIdx = (start.getHours() - startHour) * 2 + (start.getMinutes() >= 30 ? 1 : 0);
  let endIdx = (end.getHours() - startHour) * 2 + (end.getMinutes() > 0 ? 1 : 0);
  if (endIdx < startIdx) endIdx = startIdx + 1;
  return [startIdx, Math.max(1, endIdx - startIdx)];
}

function WeekView({
  days,
  startHour = 7,
  endHour = 20,
  events = [],
  onEventClick,
  onSlotDoubleClick,
  categoryColors = {},
}) {
  const slots = timeLabels(startHour, endHour);

  return (
    <div className="weekview-root">
      <div className="weekview-grid">
        {/* Header row */}
        <div className="weekview-time-col weekview-head-empty"></div>
        {days.map((d, i) => (
          <div
            className={`weekview-head-col${d.isToday ? " weekview-todayhead" : ""}`}
            key={i}
          >
            <div className="weekview-head-daylabel">{d.label}</div>
            <div className="weekview-head-datenum">{d.date.slice(-2)}</div>
          </div>
        ))}
        {/* Time rows + columns */}
        {slots.map((time, rowIdx) => (
          <React.Fragment key={time + rowIdx}>
            {/* Time label */}
            <div className="weekview-time-col weekview-timelabel">{time}</div>
            {days.map((d, colIdx) => (
              <div
                key={d.date + time}
                className="weekview-cell"
                onDoubleClick={() => onSlotDoubleClick?.(getTimeSlot(d.date, startHour + Math.floor(rowIdx / 2), rowIdx % 2 ? 30 : 0))}
                data-date={d.date}
                data-time={time}
              >
                {/* Events */}
                {eventsForDay(events, d)
                  .filter(e => {
                    const evStart = e.start.slice(0, 16);
                    const slotStart = getTimeSlot(d.date, startHour + Math.floor(rowIdx / 2), rowIdx % 2 ? 30 : 0);
                    return evStart === slotStart;
                  })
                  .map(event => {
                    const [row, span] = getPosForEvent(event, startHour);
                    // Only render event card at first timeslot
                    if (row !== rowIdx) return null;
                    // Pick color: calendar_id (preferred), fallback category name, fallback default
                    const color =
                      (event.calendar_id && categoryColors[event.calendar_id]) ||
                      (event.category && categoryColors[event.category]) ||
                      "var(--event-purple)";
                    return (
                      <div
                        className="weekview-event-card"
                        key={event.id}
                        style={{
                          background: color,
                          gridRow: `span ${span}`,
                        }}
                        onClick={ev => {
                          ev.stopPropagation();
                          onEventClick?.(event);
                        }}
                        title={event.title}
                      >
                        <div className="event-title">{event.title}</div>
                        <div className="event-time">
                          {event.start.slice(11, 16)}–{event.end.slice(11, 16)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default WeekView;
