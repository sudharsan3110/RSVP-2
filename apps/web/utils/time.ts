export const combineDateAndTime = (date: Date, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);

  if (hours === undefined || minutes === undefined) {
    throw new Error("Invalid time format. Expected format: 'HH:MM'");
  }

  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};
