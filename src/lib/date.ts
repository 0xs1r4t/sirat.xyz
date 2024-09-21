import moment from "moment";
// ISO timestamp to a human-readable datetime format

export const isoToNormalDate = (isoDateString: number) => {
  const date = moment(isoDateString);
  const formattedDate = date.format("MMMM Do YYYY, h:mm a");
  return formattedDate;
};

export const isoToShortHandDate = (isoDateString: number) => {
  const date = moment(isoDateString);
  const formattedDate = date.format("DD/MM/YYYY");
  return formattedDate;
};
