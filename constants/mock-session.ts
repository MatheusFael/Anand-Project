import type { MockAccount, UserType } from '@/constants/mock-accounts';

export type LoggedUser = Omit<MockAccount, 'password'>;

let loggedUser: LoggedUser | null = null;

export function setLoggedUser(user: LoggedUser) {
  loggedUser = user;
}

export function getLoggedUser() {
  return loggedUser;
}

export function clearLoggedUser() {
  loggedUser = null;
}

export function setLoggedUserType(type: UserType) {
  loggedUser = {
    name: '',
    email: '',
    type,
  };
}

export function getLoggedUserType() {
  return loggedUser?.type ?? null;
}

export function clearLoggedUserType() {
  loggedUser = null;
}
