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

  // Add state for validation errors and loading
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

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
    // Clear errors and feedback when modal opens/closes or event changes
    setErrors({});
    setFeedback({ type: "", message: "" });
    setIsSubmitting(false);
    // eslint-disable-next-line
  }, [event, open, categories]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.start) {
      newErrors.start = "Start time is required";
    }
    
    if (!formData.end) {
      newErrors.end = "End time is required";
    }
    
    if (formData.start && formData.end) {
      const startTime = new Date(formData.start);
      const endTime = new Date(formData.end);
      if (endTime <= startTime) {
        newErrors.end = "End time must be after start time";
      }
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    
    // Validate invitees format if provided
    if (formData.invitees.trim()) {
      const inviteesArray = formData.invitees.split(",").map(v => v.trim()).filter(Boolean);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = inviteesArray.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        newErrors.invitees = `Invalid email format: ${invalidEmails.join(", ")}`;
      }
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Clear general feedback
    if (feedback.message) {
      setFeedback({ type: "", message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setFeedback({ type: "error", message: "Please fix the errors above" });
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    setFeedback({ type: "", message: "" });
    
    try {
      // Pass normalized object, including invitees as array
      // Trigger onSave with both calendar_id and categoryId for robustness (App.js will handle mapping).
      await onSave({
        title: formData.title.trim(),
        description: formData.description.trim(),
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
      
      // Success feedback - the modal should close via onSave success
      setFeedback({ type: "success", message: `${event?.id ? "Updated" : "Created"} successfully!` });
    } catch (error) {
      console.error("Form submission error:", error);
      setFeedback({ 
        type: "error", 
        message: error?.message || `Failed to ${event?.id ? "update" : "create"} event. Please try again.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const isFormValid = () => {
    return formData.title.trim() && 
           formData.start && 
           formData.end && 
           formData.categoryId &&
           new Date(formData.end) > new Date(formData.start);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        <form className="event-form" onSubmit={handleSubmit} role="form">
          <h3 style={{marginBottom:9}}>
            {event && event.id ? "Edit " : "Create "} 
            {formData.isAppointment ? "Appointment" : "Event"}
          </h3>
          
          {/* General feedback */}
          {feedback.message && (
            <div 
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                marginBottom: "12px",
                fontSize: "14px",
                backgroundColor: feedback.type === "error" ? "#ffebee" : "#e8f5e8",
                color: feedback.type === "error" ? "#c62828" : "#2e7d32",
                border: `1px solid ${feedback.type === "error" ? "#ffcdd2" : "#c8e6c9"}`
              }}
            >
              {feedback.message}
            </div>
          )}
          
          <label>
            Title
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              autoFocus 
              required 
              style={errors.title ? { borderColor: "#f44336" } : {}}
            />
            {errors.title && <div style={{ color: "#f44336", fontSize: "12px", marginTop: "4px" }}>{errors.title}</div>}
          </label>
          
          <label>
            Start
            <input 
              name="start" 
              type="datetime-local" 
              value={formData.start} 
              onChange={handleChange} 
              required 
              style={errors.start ? { borderColor: "#f44336" } : {}}
            />
            {errors.start && <div style={{ color: "#f44336", fontSize: "12px", marginTop: "4px" }}>{errors.start}</div>}
          </label>
          
          <label>
            End
            <input 
              name="end" 
              type="datetime-local" 
              value={formData.end} 
              onChange={handleChange} 
              required 
              style={errors.end ? { borderColor: "#f44336" } : {}}
            />
            {errors.end && <div style={{ color: "#f44336", fontSize: "12px", marginTop: "4px" }}>{errors.end}</div>}
          </label>
          
          <label>
            Category
            <select 
              name="categoryId" 
              value={formData.categoryId} 
              onChange={handleChange}
              style={errors.categoryId ? { borderColor: "#f44336" } : {}}
            >
              {categories.map(cat => (
                <option value={cat.id} key={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <div style={{ color: "#f44336", fontSize: "12px", marginTop: "4px" }}>{errors.categoryId}</div>}
          </label>
          
          <label>
            Description
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
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
              style={errors.invitees ? { borderColor: "#f44336" } : {}}
            />
            {errors.invitees && <div style={{ color: "#f44336", fontSize: "12px", marginTop: "4px" }}>{errors.invitees}</div>}
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
            <button type="button" onClick={onClose} style={{marginRight: 7}} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || !isFormValid()}
              style={{
                opacity: isSubmitting || !isFormValid() ? 0.6 : 1,
                cursor: isSubmitting || !isFormValid() ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? "Saving..." : (event && event.id ? "Save" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventAppointmentModal;
