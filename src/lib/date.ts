import dayjs from "dayjs";

// ISO timestamp to a human-readable datetime format
export const isoToNormalDate = (isoDateString: number) => {
  const date = dayjs(isoDateString);
  const formattedDate = date.format("MMMM D YYYY, h:mm a");
  return formattedDate;
};

export const isoToShortHandDate = (isoDateString: number) => {
  const date = dayjs(isoDateString);
  const formattedDate = date.format("DD/MM/YYYY");
  return formattedDate;
};
