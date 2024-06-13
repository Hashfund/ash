import { EventSchema, type Event } from "@hashfund/program";

export function parseLogs(logs: string[]) {
  const regex = /emit!/g;
  let events = {} as Event;

  for (const log of logs) {
    if (log.search(regex) > 0) {
      try {
        events = {
          ...events,
          ...EventSchema.deserialize(
            Buffer.from(log.split(regex)[1], "base64")
          ),
        };
      } catch {}
    }
  }

  return events;
}
