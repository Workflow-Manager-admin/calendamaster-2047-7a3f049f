import React, { useRef, useState } from "react";

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
 *   onEventUpdate: fn(eventId, { start, end })
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
  // Filter out events without proper date format to prevent errors
  return events.filter(e => {
    if (!e.start || typeof e.start !== 'string') return false;
    try {
      return e.start.slice(0, 10) === day.date;
    } catch (err) {
      console.warn("Invalid event date format:", e);
      return false;
    }
  });
}

function getTimeSlot(date, hour, min) {
  return `${date}T${String(hour).padStart(2, "0")}:${min ? "30" : "00"}`;
}

function getPosForEvent(event, startHour) {
  // Returns [rowIndex, rowSpan] for positioning; assumes local time
  try {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn("Invalid event dates:", event);
      return [0, 1]; // Default position
    }
    
    const startIdx = Math.max(0, (start.getHours() - startHour) * 2 + (start.getMinutes() >= 30 ? 1 : 0));
    let endIdx = Math.max(0, (end.getHours() - startHour) * 2 + (end.getMinutes() > 0 ? 1 : 0));
    
    // Ensure end is after start
    if (endIdx <= startIdx) endIdx = startIdx + 1;
    
    return [startIdx, Math.max(1, endIdx - startIdx)];
  } catch (err) {
    console.warn("Error calculating event position:", err, event);
    return [0, 1]; // Default position
  }
}

/**
 * Handles drag and resize of events.
 * We use local state for dragging/resizing, and call onEventUpdate when the changes are confirmed.
 */

function WeekView({
  days,
  startHour = 7,
  endHour = 20,
  events = [],
  onEventClick,
  onSlotDoubleClick,
  categoryColors = {},
  onEventUpdate, // fn(eventId, { start, end })
}) {
  const slots = timeLabels(startHour, endHour);

  // Drag/resize state (shared for all events; at most one active)
  const [dragData, setDragData] = useState(null);
  // dragData: { eventId, type: "move"|"resize-top"|"resize-bottom", origStart, origEnd, pointerStartY, curY, origGridY, gridRow, gridSpan, dayIdx }

  const calendarGridRef = useRef();

  // Calculate vertical slot height in pixels
  function getCellHeightPx() {
    // pick any cell to measure
    if (!calendarGridRef.current) return 40;
    const cell = calendarGridRef.current.querySelector(".weekview-cell");
    if (cell) return cell.getBoundingClientRect().height;
    return 40;
  }

  // Utilities for time/slot <-> px conversions
  function slotIdxToTime(startHour, idx) {
    // 0 => startHour:00, 1 => startHour:30, etc.
    const h = startHour + Math.floor(idx / 2);
    const m = idx % 2 ? 30 : 0;
    return { hour: h, minute: m };
  }

  function getDateTimeForPos(day, rowIdx, startHour) {
    // EX: '2025-03-24', 6, 7 => '2025-03-24T10:00'
    const { hour, minute } = slotIdxToTime(startHour, rowIdx);
    return `${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  }

  function getRowIdxForMinutes(hour, minute, startHour) {
    return (hour - startHour) * 2 + (minute >= 30 ? 1 : 0);
  }

  // Mouse event handlers for drag/resize
  function handleEventMouseDown(e, event, type, dayIdx, row, span) {
    e.stopPropagation();
    e.preventDefault();
    const pointerY = e.clientY || (e.touches?.[0]?.clientY);
    setDragData({
      eventId: event.id,
      type, // "move", "resize-top", "resize-bottom"
      origStart: event.start,
      origEnd: event.end,
      pointerStartY: pointerY,
      origGridY: row,
      gridRow: row,
      gridSpan: span,
      dayIdx
    });
    // Disable text selection while dragging
    document.body.style.userSelect = "none";
  }

  function handleMouseMove(e) {
    if (!dragData) return;
    const pointerY = e.clientY || (e.touches?.[0]?.clientY);
    const cellHeight = getCellHeightPx();
    let deltaRows = Math.round((pointerY - dragData.pointerStartY) / cellHeight);
    let newRow = dragData.gridRow, newSpan = dragData.gridSpan, newStartRow = dragData.gridRow, newEndRow = dragData.gridRow + dragData.gridSpan;

    if (dragData.type === "move") {
      // Move whole event block up/down (drag both top/bottom)
      newRow = Math.max(0, dragData.gridRow + deltaRows);
      // clamp so it doesn't go past the last visible slot
      if (newRow + dragData.gridSpan > timeLabels(startHour, endHour).length)
        newRow = timeLabels(startHour, endHour).length - dragData.gridSpan;
      setDragData((d) => ({ ...d, gridRow: newRow }));
    } else if (dragData.type === "resize-top") {
      // Decrease row/height from top, drag top edge up/down
      newStartRow = Math.max(0, dragData.gridRow + deltaRows);
      if (newStartRow >= dragData.gridRow + dragData.gridSpan - 1)
        newStartRow = dragData.gridRow + dragData.gridSpan - 1; // minimum 1 slot remain
      setDragData((d) => ({
        ...d,
        gridRow: newStartRow,
        gridSpan: dragData.gridRow + dragData.gridSpan - newStartRow,
      }));
    } else if (dragData.type === "resize-bottom") {
      // Drag bottom edge, increase span
      newEndRow = dragData.gridRow + dragData.gridSpan + deltaRows;
      if (newEndRow <= dragData.gridRow + 1)
        newEndRow = dragData.gridRow + 1; // minimum 1 slot
      if (newEndRow > timeLabels(startHour, endHour).length)
        newEndRow = timeLabels(startHour, endHour).length;
      setDragData((d) => ({
        ...d,
        gridSpan: newEndRow - dragData.gridRow,
      }));
    }
  }

  function handleMouseUp(e) {
    if (!dragData) return;
    document.body.style.userSelect = "";
    const cellHeight = getCellHeightPx();
    let finalRow = dragData.gridRow, finalSpan = dragData.gridSpan, dayIdx = dragData.dayIdx;
    let newStartTime = getDateTimeForPos(days[dayIdx].date, finalRow, startHour);
    let newEndTime = getDateTimeForPos(
      days[dayIdx].date,
      finalRow + finalSpan,
      startHour
    );
    if (dragData.type === "move") {
      // Offset end relative to start, keep the duration as in original event
      const origStart = new Date(dragData.origStart);
      const origEnd = new Date(dragData.origEnd);
      const slotDiff = finalRow - dragData.origGridY;
      newStartTime = getDateTimeForPos(days[dayIdx].date, finalRow, startHour);
      // Add duration (span) in slots to new start to compute new end
      newEndTime = getDateTimeForPos(
        days[dayIdx].date,
        finalRow + dragData.gridSpan,
        startHour
      );
    } else if (dragData.type === "resize-top") {
      // Only move start
      newStartTime = getDateTimeForPos(days[dayIdx].date, finalRow, startHour);
      newEndTime = dragData.origEnd;
    } else if (dragData.type === "resize-bottom") {
      newStartTime = dragData.origStart;
      newEndTime = getDateTimeForPos(
        days[dayIdx].date,
        finalRow + finalSpan,
        startHour
      );
    }
    // Round to nearest half hour
    setDragData(null);
    if (
      newStartTime !== dragData.origStart ||
      newEndTime !== dragData.origEnd
    ) {
      onEventUpdate?.(dragData.eventId, { start: newStartTime, end: newEndTime });
    }
  }

  React.useEffect(() => {
    if (dragData) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }); // runs every render if dragData

  function renderEventCard(event, dayIdx, rowIdx, span) {
    // Active drag/resize
    const isDragging = dragData && dragData.eventId === event.id;

    // If dragging, override display row/span
    let displayRow = rowIdx, displaySpan = span;
    if (isDragging) {
      displayRow = dragData.gridRow;
      displaySpan = dragData.gridSpan;
    }
    const calColor =
      (event.calendar_id && categoryColors[event.calendar_id]) ||
      (event.category && categoryColors[event.category]) ||
      event.color ||
      "var(--event-purple)";
    // Distinguish appointment visually by badge/pill coloring and/or italic subheader for invitees.
    const isAppointment = !!event.is_appointment;
    const inviteeString =
      event.invitees && event.invitees.length
        ? "Invited: " + event.invitees.join(", ")
        : "";

    return (
      <div
        className="weekview-event-card"
        key={event.id}
        style={{
          background: calColor,
          border: `1.7px solid ${calColor}`,
          gridRow: `span ${displaySpan}`,
          position: "absolute",
          top: `${displayRow * getCellHeightPx() + 5}px`,
          left: "7px",
          right: "7px",
          zIndex: isDragging ? 10 : 2,
          boxShadow: `0 4px 17px ${calColor}22`,
          cursor: dragData
            ? dragData.type === "move"
              ? "grabbing"
              : "ns-resize"
            : "pointer",
          opacity: isDragging ? 0.8 : 1,
          userSelect: "none",
          minHeight: "32px",
          ...(isAppointment && {
            border: "2.5px dashed #ffca28",
            background: "#fff7e9",
            color: "#176cae", // primary color text for high contrast
          }),
        }}
        onMouseDown={(e) => {
          if (!isDragging) handleEventMouseDown(e, event, "move", dayIdx, rowIdx, span);
        }}
        onTouchStart={(e) => {
          if (!isDragging) handleEventMouseDown(e, event, "move", dayIdx, rowIdx, span);
        }}
        onClick={(ev) => {
          if (dragData) return;
          ev.stopPropagation();
          onEventClick?.(event);
        }}
        title={event.title + (inviteeString ? " (" + inviteeString + ")" : "")}
      >
        {/* Resize handles */}
        <div
          style={{
            position: "absolute",
            left: 3,
            right: 3,
            top: -5,
            height: 10,
            zIndex: 11,
            cursor: "ns-resize",
            opacity: isDragging && dragData.type === "resize-top" ? 0.7 : 0.5,
          }}
          onMouseDown={(e) => handleEventMouseDown(e, event, "resize-top", dayIdx, rowIdx, span)}
          onTouchStart={(e) => handleEventMouseDown(e, event, "resize-top", dayIdx, rowIdx, span)}
        />
        <div className="event-title" style={isAppointment ? { color: "#a96916", fontWeight: 700 } : {}}>
          {event.title}
          {isAppointment && (
            <span
              style={{
                display: "inline-block",
                marginLeft: 8,
                background: "#ffe790",
                color: "#986b15",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "2px 7px",
                letterSpacing: "0.02em",
                verticalAlign: "middle",
              }}
            >
              Appointment
            </span>
          )}
        </div>
        <div className="event-time">
          {event.start.slice(11, 16)}–{event.end.slice(11, 16)}
        </div>
        {isAppointment && inviteeString && (
          <div
            style={{
              fontSize: "11.2px",
              fontStyle: "italic",
              color: "#3273a6",
              marginTop: "1.5px",
              opacity: 0.66,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {inviteeString}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: 3,
            right: 3,
            bottom: -5,
            height: 10,
            zIndex: 11,
            cursor: "ns-resize",
            opacity: isDragging && dragData.type === "resize-bottom" ? 0.7 : 0.5,
          }}
          onMouseDown={(e) => handleEventMouseDown(e, event, "resize-bottom", dayIdx, rowIdx, span)}
          onTouchStart={(e) => handleEventMouseDown(e, event, "resize-bottom", dayIdx, rowIdx, span)}
        />
      </div>
    );
  }

  // Split events by day for easier mapping
  function eventsForDaySorted(events, day) {
    return eventsForDay(events, day).sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );
  }

  return (
    <div className="weekview-root" ref={calendarGridRef}>
      <div className="weekview-grid" style={{ position: "relative" }}>
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
                style={{ position: "relative", minHeight: 32 }}
              >
                {/* Events */}
                {eventsForDaySorted(events, d)
                  .map(event => {
                    // Only show each event in its starting slot
                    const [row, span] = getPosForEvent(event, startHour);
                    if (row !== rowIdx) return null;
                    return renderEventCard(event, colIdx, row, span);
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
