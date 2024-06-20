import axios from "axios";

export const safeRequest = (uri: string) => {
  return axios
    .get(uri)
    .then((response) => response.data)
    .catch(() => null);
};
