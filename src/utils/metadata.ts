import axios from "axios";

export const resolveMetadataUri = (uri: string) => {
  return axios
    .get(uri)
    .then((response) => response.data)
    .catch(() => null);
};
