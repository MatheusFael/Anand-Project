import type { MockAccount, UserType } from '@/constants/mock-accounts';

export type LoggedUser = Omit<MockAccount, 'password'>;
export type ViewedPatient = Omit<MockAccount, 'password'>;

let loggedUser: LoggedUser | null = null;
let viewedPatient: ViewedPatient | null = null;

export function setLoggedUser(user: LoggedUser) {
  loggedUser = user;
}

export function getLoggedUser() {
  return loggedUser;
}

export function clearLoggedUser() {
  loggedUser = null;
  viewedPatient = null;
}

export function setViewedPatient(patient: ViewedPatient) {
  viewedPatient = patient;
}

export function getViewedPatient() {
  return viewedPatient;
}

export function clearViewedPatient() {
  viewedPatient = null;
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
