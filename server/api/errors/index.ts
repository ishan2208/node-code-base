/* tslint:disable:max-classes-per-file*/
export class AppError extends Error {
  statusCode: number;
  statusMessage: object;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode ? statusCode : 400;
    this.statusMessage = { message };
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidRequestError extends AppError {
  constructor(message?: string, statusCode?: number) {
    const defaultErrorMsg = 'Invalid request. Please check the attributes.';

    const errorMessage = message ? message : defaultErrorMsg;
    const errorStatus = statusCode ? statusCode : 400;

    super(errorMessage, errorStatus);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalServerError extends AppError {
  constructor(message?: string, statusCode?: number) {
    const defaultErrorMsg = 'Something went wrong. Please try again later.';

    const errorMessage = message ? message : defaultErrorMsg;
    const errorStatus = statusCode ? statusCode : 500;

    super(errorMessage, errorStatus);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidUsernameError extends AppError {
  constructor(message?: string, statusCode?: number) {
    const errorMessage = message ? message : 'Invalid username.';
    const errorStatus = statusCode ? statusCode : 400;

    super(errorMessage, errorStatus);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DBConflictError extends AppError {
  constructor(message?: string, statusCode?: number) {
    const errorMessage = message ? message : 'Entry already exists.';
    const errorStatus = statusCode ? statusCode : 409;

    super(errorMessage, errorStatus);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DBMissingEntityError extends AppError {
  constructor(message?: string, statusCode?: number) {
    const errorMessage = message ? message : 'Resource does not exist.';
    const errorStatus = statusCode ? statusCode : 400;

    super(errorMessage, errorStatus);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PasswordMismatchError extends AppError {
  constructor(message?: string, statusCode?: number) {
    const errorMessage = message ? message : 'Password did not match.';
    const errorStatus = statusCode ? statusCode : 401;

    super(errorMessage, errorStatus);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ExpiredAccountError extends AppError {
  constructor(message?: string, statusCode?: number) {
    const errorMessage = message
      ? message
      : 'Account has expired or has been deactivated.';
    const errorStatus = statusCode ? statusCode : 403;

    super(errorMessage, errorStatus);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class StaffPermissionError extends AppError {
  constructor(message?: string, statusCode?: number) {
    const errorMessage = message
      ? message
      : 'Staff does not have required permission.';
    const errorStatus = statusCode ? statusCode : 403;

    super(errorMessage, errorStatus);
    Error.captureStackTrace(this, this.constructor);
  }
}
