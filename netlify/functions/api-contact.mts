import { handleGet } from "./_shared/http.mts";
import { handleContact } from "../../src/api.ts";

export default (req: Request): Promise<Response> => handleGet(req, () => handleContact());

export const config = { path: ["/api/contact"] };
