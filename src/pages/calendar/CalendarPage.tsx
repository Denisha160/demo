import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  time: string;
  type: "meeting" | "call" | "followup" | "deadline";
  contact?: string;
}

const eventsByDate: Record<string, Event[]> = {
  "2026-02-09": [
    { id: "e1", title: "Team Standup", time: "9:00 AM", type: "meeting" },
  ],
  "2026-02-10": [
    {
      id: "e2",
      title: "Call with Acme Corp",
      time: "10:30 AM",
      type: "call",
      contact: "John Smith",
    },
    { id: "e3", title: "Proposal deadline", time: "5:00 PM", type: "deadline" },
  ],
  "2026-02-11": [
    {
      id: "e4",
      title: "Demo for CloudBase",
      time: "2:00 PM",
      type: "meeting",
      contact: "Alex Kim",
    },
  ],
  "2026-02-12": [
    {
      id: "e5",
      title: "Follow up TechStart",
      time: "11:00 AM",
      type: "followup",
      contact: "Sarah Lee",
    },
    { id: "e6", title: "Sales review", time: "3:00 PM", type: "meeting" },
  ],
  "2026-02-13": [
    {
      id: "e7",
      title: "Client lunch",
      time: "12:30 PM",
      type: "meeting",
      contact: "Mike Chen",
    },
    { id: "e8", title: "Q1 planning", time: "4:00 PM", type: "meeting" },
    { id: "e9", title: "Invoice due", time: "6:00 PM", type: "deadline" },
  ],
  "2026-02-16": [
    {
      id: "e10",
      title: "Board presentation",
      time: "10:00 AM",
      type: "meeting",
    },
  ],
  "2026-02-18": [
    {
      id: "e11",
      title: "New hire onboarding",
      time: "9:00 AM",
      type: "meeting",
    },
  ],
};

const typeVariant: Record<
  string,
  "info" | "warning" | "success" | "destructive"
> = {
  meeting: "info",
  call: "success",
  followup: "warning",
  deadline: "destructive",
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
  const today = new Date(2026, 1, 13);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDateKey = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(13);
  const selectedEvents = selectedDay
    ? eventsByDate[getDateKey(selectedDay)] || []
    : [];

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{monthName}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 shadow-card border border-border bg-card rounded-sm p-2">
          <div className="grid grid-cols-7 gap-px">
            {daysOfWeek.map((d) => (
              <div
                key={d}
                className="text-center text-sm text-muted-foreground font-medium py-1"
              >
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dateKey = day ? getDateKey(day) : "";
              const events = day ? eventsByDate[dateKey] || [] : [];
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const isSelected = day === selectedDay;
              return (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() => day && setSelectedDay(day)}
                  className={`relative h-14 sm:h-16 p-1 text-left border border-border/50 transition-all rounded-sm
                    ${!day ? "bg-transparent" : "hover:bg-accent/50 cursor-pointer"}
                    ${isSelected ? "ring-1 ring-primary bg-primary/5" : ""}
                    ${isToday ? "gradient-active" : ""}
                  `}
                >
                  {day && (
                    <>
                      <span
                        className={`text-sm font-medium ${isToday ? "text-primary-foreground" : "text-foreground"}`}
                      >
                        {day}
                      </span>
                      {events.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {events.slice(0, 2).map((e) => (
                            <span
                              key={e.id}
                              className="h-1 w-1 rounded-full bg-primary"
                            />
                          ))}
                          {events.length > 2 && (
                            <span className="text-[9px] text-muted-foreground">
                              +{events.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Panel */}
        <div className="shadow-card border border-border bg-card rounded-sm p-2">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {selectedDay ? `Feb ${selectedDay} Events` : "Select a day"}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events scheduled</p>
          ) : (
            <div className="space-y-1.5">
              {selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2 border border-border rounded-sm hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {ev.title}
                    </p>
                    <StatusBadge
                      status={ev.type}
                      variant={typeVariant[ev.type]}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-muted-foreground">
                      {ev.time}
                    </span>
                    {ev.contact && (
                      <span className="text-sm text-muted-foreground">
                        • {ev.contact}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
