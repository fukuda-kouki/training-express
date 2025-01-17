class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class DBError extends MyError {}
class NotFoundError extends MyError {}
class AuthError extends MyError {}
class NotEnoughError extends MyError {}
class LimitExceededError extends MyError {}
class UndefinedError extends MyError {}

export {
  MyError,
  DBError,
  NotFoundError,
  AuthError,
  NotEnoughError,
  LimitExceededError,
  UndefinedError,
};
