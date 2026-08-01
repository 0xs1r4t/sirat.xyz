import dayjs from "dayjs";

/** Formats an ISO timestamp as "March 5 2026, 3:45 pm". */
export const isoToNormalDate = (isoDateString: number) => {
  const date = dayjs(isoDateString);
  const formattedDate = date.format("MMMM D YYYY, h:mm a");
  return formattedDate;
};

/** Formats an ISO timestamp as "05/03/2026". */
export const isoToShortHandDate = (isoDateString: number) => {
  const date = dayjs(isoDateString);
  const formattedDate = date.format("DD/MM/YYYY");
  return formattedDate;
};
