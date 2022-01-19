import React from "react";
import { Timeline } from "react-twitter-widgets";

type Props = {
  account: string;
};
export function TwitterTimeline({ account }: Props) {
  return (
    <Timeline
      dataSource={{
        sourceType: "profile",
        screenName: account,
      }}
    />
  );
}
