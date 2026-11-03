import { gql } from "@apollo/client";

export const GetActiveDirectoryUserQuery = gql`
  query GetActiveDirectoryUser($searchString: String!) {
    getActiveDirectoryUser(searchString: $searchString)
  }
`;

export const ActiveDirectoryMocks = [
  {
    request: {
      query: GetActiveDirectoryUserQuery,
      variables: {
        searchString: "bill.brasky",
      },
    },

    result: {
      data: {
        getActiveDirectoryUser: {
          distinguishedName: "CN=Brasky\\, Bill,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
          principalName: "bill.brasky@gentex.com",
          accountName: "bill.brasky",
          employeeId: "69",
          givenName: "Bill",
          surname: "Brasky",
          name: "Brasky, Bill",
          department: "Test and Measurement",
          email: "bill.brasky@gentex.com",
          mobilePhone: "9895684589",
          phone: "+1 (616) 7721590 x2345",
          website: null,
          azureADObjectId: "e78908-61a1-4857-8c70-d0973334256e",
          objectId: "81b7c79a-atead-4bef-b9f5-fdd0e4796a6c",
          sid: "S-1-5-21-56231545-804616388-477645130-30460",
          pager: "19992",
          manager: "CN=Meyer\\, Oscar,OU=Zeeland,OU=NORTH_AMERICA,OU=Users_OU,DC=gentex,DC=com",
        },
      },
    },
  },
  {
    request: {
      query: GetActiveDirectoryUserQuery,
      variables: {
        searchString: "tony.pizza",
      },
    },

    result: {
      data: {
        getActiveDirectoryUser: {},
      },
    },
  },
];
