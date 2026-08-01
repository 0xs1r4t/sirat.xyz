const fetcher = async <JSON>(
  input: string,
  init?: RequestInit
): Promise<JSON> => {
  const fetchUrl = input;
  const res = await fetch(fetchUrl, init);
  return res.json() as Promise<JSON>;
};

export default fetcher;
