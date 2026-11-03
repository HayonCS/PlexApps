import * as Hexagonal from "atomic-object/hexagonal";
import { EmployeePicturePort } from "./port";
import { getEmployeePicture } from "./employee-picture";

export type EmployeePicture = {
  getEmployeePicture: (employeeNumber: number) => Promise<String>;
};
export const employeePictureAdapter = Hexagonal.adapter({
  port: EmployeePicturePort,
  requires: [],
  build: () => {
    return {
      getEmployeePicture: async (employeeNumber: number): Promise<String> => {
        return getEmployeePicture(employeeNumber);
      },
    };
  },
});
