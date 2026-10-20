import { handleGet } from "./_shared/http.mts";
import { handleWarningLight } from "../../src/api.ts";

export default (req: Request): Promise<Response> => handleGet(req, handleWarningLight);

export const config = { path: ["/api/warning-light"] };
