import { handleGet } from "./_shared/http.mts";
import { handleNextService } from "../../src/api.ts";

export default (req: Request): Promise<Response> => handleGet(req, handleNextService);

export const config = { path: ["/api/next-service"] };
