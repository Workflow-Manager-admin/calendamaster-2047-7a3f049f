import React, { useEffect, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Event/Appointment modal form for create and edit.
 *    - Supports: Title, Description, Time (start/end), Category (calendar), Invitees, and type (event/appointment).
 *    - Accepts: open (bool, whether modal is open), onClose (fn), onSave (fn)
 *    - Used for both new creation (no event prop) and edit (event prop provided)
 *    - categories: Array<{ id, name, color }>
 */
function EventAppointmentModal({
  open,
  event,
  onClose,
  onSave,
  categories,
  defaultStart,
  defaultEnd,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start: defaultStart || "",
    end: defaultEnd || "",
    categoryId: categories && categories.length ? categories[0].id : 1,
    invitees: "",
    isAppointment: false,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        start: event.start || defaultStart || "",
        end: event.end || defaultEnd || "",
        categoryId: event.calendar_id || (categories && categories[0]?.id) || 1,
        invitees: event.invitees?.join?.(", ") || "",
        isAppointment: !!event.is_appointment,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        start: defaultStart || "",
        end: defaultEnd || "",
        categoryId: (categories && categories.length ? categories[0].id : 1),
        invitees: "",
        isAppointment: false,
      });
    }
    // eslint-disable-next-line
  }, [event, open, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation
    if (!formData.title.trim() || !formData.start || !formData.end || !formData.categoryId) return;
    // Pass normalized object, including invitees as array
    // Trigger onSave with both calendar_id and categoryId for robustness (App.js will handle mapping).
    onSave({
      title: formData.title,
      description: formData.description,
      start: formData.start,
      end: formData.end,
      calendar_id: parseInt(formData.categoryId, 10),
      categoryId: formData.categoryId,
      invitees: formData.invitees
        ? formData.invitees.split(",").map((v) => v.trim()).filter(Boolean)
        : [],
      is_appointment: formData.isAppointment,
      isAppointment: formData.isAppointment,
    });
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        <form className="event-form" onSubmit={handleSubmit}>
          <h3 style={{marginBottom:9}}>
            {event && event.id ? "Edit " : "Create "} 
            {formData.isAppointment ? "Appointment" : "Event"}
          </h3>
          <label>
            Title
            <input name="title" value={formData.title} onChange={handleChange} autoFocus required />
          </label>
          <label>
            Start
            <input name="start" type="datetime-local" value={formData.start} onChange={handleChange} required />
          </label>
          <label>
            End
            <input name="end" type="datetime-local" value={formData.end} onChange={handleChange} required />
          </label>
          <label>
            Category
            <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
              {categories.map(cat => (
                <option value={cat.id} key={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows={2}
              placeholder="Optional description"
            />
          </label>
          <label>
            Invitees (email/username, comma-separated)
            <input
              type="text"
              name="invitees"
              placeholder="Enter usernames or emails"
              value={formData.invitees}
              onChange={handleChange}
              autoComplete="off"
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <input
              type="checkbox"
              name="isAppointment"
              checked={formData.isAppointment}
              onChange={handleChange}
              style={{ marginRight: 8 }}
            />
            Appointment (invitation required)
          </label>
          <div className="event-form-actions">
            <button type="button" onClick={onClose} style={{marginRight: 7}}>Cancel</button>
            <button type="submit" className="btn-primary">
              {event && event.id ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventAppointmentModal;
