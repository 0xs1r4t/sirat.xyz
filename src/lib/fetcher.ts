const fetcher = async <JSON>(
  input: string,
  init?: RequestInit
): Promise<JSON> => {
  const fetch_url = input;
  const res = await fetch(fetch_url, init);
  return res.json() as Promise<JSON>;
};

export default fetcher;
