import config from "config";
import { GraphQLError } from "graphql";

export async function getEmployeePicture(employeeNumber: number): Promise<String> {
  const employeePictureUrl = config.get<string>("restApi.mesUserPictureEndpoint") + employeeNumber.toString();

  return fetch(employeePictureUrl)
    .then(async (result) => {
      const arrayBuffer = await result.arrayBuffer();

      const base64 = Buffer.from(arrayBuffer).toString(`base64`);
      return `data:image/jpeg;base64, ${base64}`;
    })
    .catch((error: GraphQLError) => {
      return error.toString();
    });
}
