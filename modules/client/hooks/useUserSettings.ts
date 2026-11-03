import { useGetUserSettingsQuery } from "../graphql/types.gen";

export const useUserSettings = (userName: string) => {
  const { data } = useGetUserSettingsQuery({ variables: { userName: userName } });
  return data;
};
