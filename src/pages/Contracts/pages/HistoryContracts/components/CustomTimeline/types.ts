import { IUserInfo } from "../../../../../../contexts/ContractContext/types";

export interface ITimelineEvent {
  date: string;
  time: string;
  status: string;
  owner_change: IUserInfo;
}

export interface ITimelineProps {
  events: ITimelineEvent[];
}
