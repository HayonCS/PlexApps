export type UserName = string;
export type EmployeeNumber = number;
export type Email = string;

export type UserNameOrEmployeeNumber = UserName | EmployeeNumber;
export type UserNameOrEmail = UserName | Email;

export const isEmail = (userNameOrEmail: UserNameOrEmail): userNameOrEmail is Email => {
  return userNameOrEmail.includes("@");
};

export const isUserName = (userNameOrEmail: UserNameOrEmail): userNameOrEmail is UserName => {
  return !isEmail(userNameOrEmail);
};

export type UserInfoResponse = {
  username: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  emailAddress: string;
  isServiceAccount: boolean;
  pager: string;
  roles: string[];
  distributionLists: string[];
  manager?: UserInfoResponse;
};

export type OpsManagerUser = {
  distinguishedName: string;
  principalName: string;
  userName: string;
  employeeNumber: number;
  firstName: string;
  lastName: string;
  formattedName: string;
  department: string;
  emailAddress: string;
  mobilePhone: string;
  gentexPhone: string;
  sid: string;
  pager: string;
  manager: string;
  readOnly: boolean;
};

export type OpsManagerUserAndAppKey = OpsManagerUser & {
  AppKey: string;
};
