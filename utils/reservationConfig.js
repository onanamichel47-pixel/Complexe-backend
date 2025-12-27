// backend/utils/reservationConfig.js
export const getReminderHours = () => {
  const h = Number(process.env.RESERVATION_REMINDER_HOURS || 5);
  return h > 0 ? h : 5;
};
