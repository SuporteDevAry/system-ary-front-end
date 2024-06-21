import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";

interface ITimelineEvent {
  date: string;
  time: string;
  status: string;
}

interface ITimelineProps {
  events: ITimelineEvent[];
}

export function CustomTimeline({ events }: ITimelineProps): JSX.Element {
  return (
    <Timeline position="alternate">
      {events.map((event, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent color="text.secondary">
            {event.date} - {event.time}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
            {index < events.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>{event.status}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
