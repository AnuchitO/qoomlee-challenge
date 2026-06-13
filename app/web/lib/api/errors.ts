export type HttpError =
  | { type: "NETWORK_ERROR"; message: string }
  | { type: "BAD_STATUS"; status: number; message: string };

function badStatus(status: number, message: string): HttpError {
  return { type: "BAD_STATUS", status, message };
}

export const HttpError = {
  networkError: (message: string): HttpError => ({ type: "NETWORK_ERROR", message }),
  badStatus,
  badRequest: (message = "Bad Request"): HttpError => badStatus(400, message),
  unauthorized: (message = "Unauthorized"): HttpError => badStatus(401, message),
  forbidden: (message = "Forbidden"): HttpError => badStatus(403, message),
  notFound: (message = "Not Found"): HttpError => badStatus(404, message),
  internalServerError: (message = "Internal Server Error"): HttpError => badStatus(500, message),
};
