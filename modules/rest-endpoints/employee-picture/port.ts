import * as Hexagonal from "atomic-object/hexagonal";
import { EmployeePicture } from "./index";

export const EmployeePicturePort = Hexagonal.port<EmployeePicture, "EmployeePicture">("EmployeePicture");
export type EmployeePicturePortType = typeof EmployeePicturePort;
