import { httpClient } from "./httpClient";

export const noteRequest = (note: any) => httpClient.post("note", note);
