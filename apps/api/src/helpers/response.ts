export const responseHandle = (
  message: string,
  data: any,
  success: boolean = true,
) => {
  return {
    message,
    data,
    success,
  };
};

export class ErrorHandler extends Error {
  statuscode: number;
  constructor(message: string, status: number) {
    super(message);
    this.statuscode = status;
  }
}
