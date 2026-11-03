import * as React from "react";
import { useGetEmployeePictureQuery } from "../graphql/types.gen";

export type GetEmployeePictureHookResponseType = "ERROR" | "LOADING" | string;

export const useGetEmployeePicture = (employeeNumber: number): GetEmployeePictureHookResponseType => {
  const [employeePicture, setEmployeePicture] = React.useState<GetEmployeePictureHookResponseType>("LOADING");

  const query = useGetEmployeePictureQuery({
    variables: {
      employeeNumber: employeeNumber || -1,
    },
    skip: employeeNumber === -1 || employeeNumber === null,
    fetchPolicy: "cache-and-network",
  });

  React.useEffect(() => {
    if (query.called && !query.loading) {
      if (query.data) {
        if (query.data.getEmployeePicture) {
          setEmployeePicture(query.data.getEmployeePicture);
        } else {
          setEmployeePicture("");
        }
      }

      if (query.error) {
        setEmployeePicture("ERROR");
      }
    } else if (query.loading) {
      setEmployeePicture("LOADING");
    }
  }, [query]);

  return employeePicture;
};
