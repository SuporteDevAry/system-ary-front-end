import { IUserInfo } from "../../../../contexts/ContractContext/types";

export type ITimelineEvent = {
  date: string;
  time: string;
  status: string;
  owner_change: IUserInfo;
};
