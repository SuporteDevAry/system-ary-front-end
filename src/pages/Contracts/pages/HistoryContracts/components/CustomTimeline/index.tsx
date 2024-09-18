import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { ITimelineProps } from "./types";

export function CustomTimeline({ events }: ITimelineProps): JSX.Element {
  return (
    <Timeline position="alternate">
      {events.map((event, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent color="text.secondary">
            {event.date} - {event.time}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <Tooltip
              title={`Alterado por: ${event.owner_change.name} - ${event.owner_change.email}`}
              arrow
            >
              <Avatar>{event.owner_change.name.charAt(0)}</Avatar>
            </Tooltip>
            {index < events.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>{event.status}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
