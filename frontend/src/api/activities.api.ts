import { httpClient } from "./httpClient";

export const activitieRequest = (activitie: any) =>
  httpClient.post("activitie", activitie);
