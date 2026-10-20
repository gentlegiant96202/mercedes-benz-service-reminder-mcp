import { handleGet } from "./_shared/http.mts";
import { handleServiceInfo } from "../../src/api.ts";

export default (req: Request): Promise<Response> => handleGet(req, handleServiceInfo);

export const config = { path: ["/api/service-info"] };
