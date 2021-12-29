const customDate = (isoDate) => {
   const date = new Date(isoDate);
   return date.toGMTString().substring(5, 16);
};

export default customDate;
