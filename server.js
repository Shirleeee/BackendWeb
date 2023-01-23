import { serve } from "https://deno.land/std@0.156.0/http/server.ts";
import { handleRequest } from "./src/app.js";

await serve(handleRequest, { port: 8080 });
// await serve(app.callback(), { port: 4242 });
