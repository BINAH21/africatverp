// Google Calendar integration utilities

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  color?: string;
  type: 'event' | 'holiday' | 'closed' | 'meeting' | 'broadcast';
}

export interface Holiday {
  date: Date;
  name: string;
  type: 'national' | 'religious' | 'company' | 'closed';
  description?: string;
}

// Mock calendar events (replace with Google Calendar API)
export const getCalendarEvents = async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
  // In production, this would fetch from Google Calendar API
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const today = new Date();
  const events: CalendarEvent[] = [
    // Today's events
    {
      id: '1',
      title: 'Morning News Broadcast',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
      type: 'broadcast',
      color: '#f97316',
    },
    {
      id: '2',
      title: 'Editorial Meeting',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0),
      type: 'meeting',
      color: '#3b82f6',
    },
    {
      id: '3',
      title: 'Live Sports Coverage',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0, 0),
      type: 'broadcast',
      color: '#10b981',
    },
    {
      id: '4',
      title: 'Evening News',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0),
      type: 'broadcast',
      color: '#f97316',
    },
    // Tomorrow's events
    {
      id: '5',
      title: 'Weekly Planning Meeting',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 30, 0),
      type: 'meeting',
      color: '#3b82f6',
    },
    {
      id: '6',
      title: 'Documentary Premiere',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 20, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 22, 0, 0),
      type: 'broadcast',
      color: '#10b981',
    },
    // Day after tomorrow
    {
      id: '7',
      title: 'Staff Training Session',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0, 0),
      type: 'meeting',
      color: '#8b5cf6',
    },
    // Next week events
    {
      id: '8',
      title: 'Special Report Recording',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 10, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 12, 0, 0),
      type: 'broadcast',
      color: '#f97316',
    },
    {
      id: '9',
      title: 'Board Meeting',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 15, 0, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 17, 0, 0),
      type: 'meeting',
      color: '#3b82f6',
    },
  ];
  
  return events.filter(event => {
    const eventStart = new Date(event.start);
    return eventStart >= startDate && eventStart <= endDate;
  });
};

// Get holidays and closed days
export const getHolidays = async (year: number, month?: number): Promise<Holiday[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const holidays: Holiday[] = [
    {
      date: new Date(year, 0, 1), // New Year
      name: 'New Year\'s Day',
      type: 'national',
    },
    {
      date: new Date(year, 4, 1), // Labor Day
      name: 'Labor Day',
      type: 'national',
    },
    {
      date: new Date(year, 8, 11), // Ethiopian New Year
      name: 'Ethiopian New Year',
      type: 'national',
    },
    {
      date: new Date(year, 11, 25), // Christmas
      name: 'Christmas Day',
      type: 'religious',
    },
  ];
  
  if (month !== undefined) {
    return holidays.filter(h => h.date.getMonth() === month);
  }
  
  return holidays;
};

// Check if date is a holiday or closed day
export const isHolidayOrClosed = async (date: Date): Promise<Holiday | null> => {
  const holidays = await getHolidays(date.getFullYear());
  const dateStr = date.toDateString();
  
  const holiday = holidays.find(h => h.date.toDateString() === dateStr);
  return holiday || null;
};

// Get upcoming announcements (holidays, closed days, important events)
export const getUpcomingAnnouncements = async (days: number = 7): Promise<Array<Holiday & { daysUntil: number }>> => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);
  
  const holidays = await getHolidays(today.getFullYear());
  const upcoming = holidays
    .filter(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setFullYear(today.getFullYear());
      return holidayDate >= today && holidayDate <= endDate;
    })
    .map(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setFullYear(today.getFullYear());
      const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...h, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
  
  return upcoming;
};

