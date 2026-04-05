"use client";

import { useEffect, useState } from "react";
import GlobeView from "@/components/GlobeView";
import { fetchEvents } from "@/lib/eonet";
import { EonetEvent } from "@/lib/types";

export default function Home() {
  const [events, setEvents] = useState<EonetEvent[]>([]);

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  return (
    <div className="h-screen w-screen">
      <GlobeView
        events={events}
        onEventClick={(e) => console.log("click", e.title)}
        onEventHover={(e) => console.log("hover", e?.title)}
      />
    </div>
  );
}
