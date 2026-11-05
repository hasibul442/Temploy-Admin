/**
 * Message for a failed ApiRequestHandler result (`{ message, response }`): the first field error of a
 * 422, else the API's message.
 */
export function getErrorMessage(res) {
  const errors = res?.response?.data?.errors;
  const first = errors && Object.values(errors).flat()[0];
  return first || res?.message || "Something went wrong";
}
