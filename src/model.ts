import axios from "axios";

export const http = axios.create({
  baseURL: "https://indexer.crossbell.io",
  timeout: 30 * 1000,
});
export const handleFileToXlog = () => {};

export const defaultSettings = () => ({
  enable: true,
  token: "",
  charactorID: "",
  autoUpload: true,
  debugger: false,
  isMultiCharactor: false,
  charactorList: [] as Array<{ name: string; value: string }>,
});
