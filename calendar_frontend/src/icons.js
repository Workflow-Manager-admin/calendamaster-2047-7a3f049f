import React from "react";

// PUBLIC_INTERFACE
export function IconCalendar(props) {
  return (
    <svg width={props.size || 21} height={props.size || 21} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="6" width="16" height="14" rx="3" stroke="#3E7DC4" strokeWidth="2" fill="#E5F1FB"/>
      <path d="M16 2v2M8 2v2" stroke="#176CAE" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 10h16" stroke="#C9D6E2" strokeWidth="2"/>
    </svg>
  );
}
export function IconContacts(props) {
  return (
    <svg width={props.size || 21} height={props.size || 21} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="10" r="4" stroke="#3E7DC4" strokeWidth="2" fill="#E5F1FB"/>
      <ellipse cx="12" cy="17" rx="7" ry="3.5" stroke="#C9D6E2" strokeWidth="2" fill="#E5F1FB"/>
    </svg>
  );
}
export function IconTasks(props) {
  return (
    <svg width={props.size || 21} height={props.size || 21} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="5" y="4" width="14" height="16" rx="3" stroke="#3E7DC4" strokeWidth="2" fill="#E5F1FB"/>
      <path d="M8 8h8M8 12h5M8 16h8" stroke="#176CAE" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function IconSearch(props) {
  return (
    <svg width={props.size || 20} height={props.size || 20} fill="none" {...props}>
      <circle cx="10" cy="10" r="7.5" stroke="#fff" strokeWidth="2"/>
      <path d="M16 16L19 19" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function IconBell(props) {
  return (
    <svg width={props.size || 21} height={props.size || 21} fill="none" {...props}>
      <path d="M12 21c1.104.003 2-.887 2-1.978h-4c0 1.092.894 1.976 2 1.978z" fill="#fff"/>
      <path d="M18 16v-5a6 6 0 10-12 0v5m1 0v0c0 .441-.363.799-.8.868a1.548 1.548 0 00-.197.048 1 1 0 00.997 1.084h13a1 1 0 00.997-1.084 1.548 1.548 0 00-.197-.048c-.437-.07-.8-.427-.8-.868" stroke="#fff" strokeWidth="2"/>
    </svg>
  );
}
export function IconCog(props) {
  return (
    <svg width={props.size || 20} height={props.size || 20} fill="none" {...props}>
      <circle cx="10" cy="10" r="3" stroke="#3E7DC4" strokeWidth="2" fill="#E5F1FB"/>
      <path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.22 4.22l1.42 1.42m9.19 9.2l1.42 1.41m0-11.31l-1.41 1.41M5.64 16.97l-1.42 1.42" stroke="#C9D6E2" strokeWidth="2"/>
    </svg>
  );
}
