import moment from "moment";
// ISO timestamp to a human-readable datetime format

const isoToNormalDate = (isoDateString: number) => {
  const date = moment(isoDateString);
  const formattedDate = date.format("MMMM Do YYYY, h:mm a");
  return formattedDate;
};

export default isoToNormalDate;
