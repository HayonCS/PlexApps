import { gql } from "@apollo/client";
import { COMMANDSET_FOR_TESTING } from "../commandset";

export const GetAllCommandSetsQuery = gql`
  query GetAllCommandSets {
    getAllCommandSets
  }
`;

export const GetCommandSetQuery = gql`
  query GetCommandSet($name: String!, $revision: Int!) {
    getCommandSet(name: $name, revision: $revision)
  }
`;

export const GetAllCommandSetsMock = (delay?: number) => {
  return {
    delay: delay ?? 0,
    request: {
      query: GetAllCommandSetsQuery,
    },
    result: {
      data: {
        getAllCommandSets: [
          "1419_Gentex_GN600_CY19.cmdset",
          "1467_FCA_DT_FDM_LIN.cmdset",
          "1467_FCA_WL_FDM_CAN.cmdset",
          "1467_FCA_WL_FDM_LIN.cmdset",
          "1689_BMW_PIC24.cmdset",
          "1723_Subaru_IEC_HL.cmdset",
          "1729_VW_Prism_HL.cmdset",
          "1764_Mercedes_AMG_X1_HyperCar.cmdset",
          "1770_Volvo_620C_Mirror.cmdset",
          "1800_Volvo_P319_IEC_HL5_CY19.cmdset",
          "1837_Toyota_500B_FDM.cmdset",
          "1837_Toyota_500B_FDM_CAN15PF.cmdset",
          "1837_Toyota_500B_FDM_CAN19PF.cmdset",
          "1845_BMW_Project_2021.cmdset",
          "1846_Volvo_620C_ITM_LIN.cmdset",
          "1857_UV_LED_Driver.cmdset",
          "1892_Audi_HL.cmdset",
          "1897_PSA_ZEV_Mirror.cmdset",
          "1911_Toyota_601B_IEC.cmdset",
          "1920_Hyundai_EC_HL_Mirror.cmdset",
          "1939_FORD_FDM.cmdset",
          "1954_GM_T1_IEC_RCD_BedCam.cmdset",
          "1972_Nissan_XC2B_IEC_FDM_AVM.cmdset",
          "1989_Audi_Lifeboat.cmdset",
          "2006_SEAT_FDM.cmdset",
          "2035_AM800_EC_HL.cmdset",
          "2072_Volvo_SPA2_Mirror.cmdset",
          "2076_Airbus_A350_EDW.cmdset",
          "2145_Entry_Level_FDM.cmdset",
          "2178_Toyota_750B_FDM.cmdset",
          "2261_Toyota_800B_FDM.cmdset",
          "2278_Mazda_EC_HL_Mirror.cmdset",
          "2315_VW_EC_HL_BLE_Mirror.cmdset",
          "3075_Honda_IEC_CY21_T90A_EC+HL.cmdset",
          "3230_Ferrari_F173_IEC_FDM.cmdset",
          "3351_Gentex_Fire_Commander_4.cmdset",
          "3379_Subaru_Gen2_FDM.cmdset",
          "3389_Mercedes_VS20_FDM.cmdset",
          "3389_Mercedes_VS20_FDM_LIN.cmdset",
        ],
      },
    },
  };
};

export const GetCommandSetMock = (delay?: number) => {
  return {
    delay: delay ?? 0,
    request: {
      query: GetCommandSetQuery,
      variables: {
        name: "1845_BMW_Project_2021.cmdset",
        revision: 52497,
      },
    },
    result: {
      data: {
        getCommandSet: {
          data: {
            ...COMMANDSET_FOR_TESTING,
          },
        },
      },
    },
  };
};
