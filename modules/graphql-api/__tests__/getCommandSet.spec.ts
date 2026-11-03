import { withContext } from "modules/__tests__/db-helpers";
import { beforeAll, describe, expect, it } from "vitest";
import { GetCommandSetDocument, GetCommandSetQuery, GetCommandSetQueryVariables } from "../../client/graphql/types.gen";
import { setupSubversionRepo } from "modules/__tests__/subversion-helpers";
import { SubversionSuffixPort } from "modules/context/ports";

describe("getCommandSet Resolver Tests", () => {
  beforeAll(
    withContext({
      async run(ctx) {
        const svnSuffix = await ctx.get(SubversionSuffixPort);
        await setupSubversionRepo(svnSuffix);
      },
    }),
    10000
  );
  it(
    "Returns a commandset document from the svn repository.",
    withContext({
      async run(ctx) {
        let queryResult = await ctx.apolloClient.query<GetCommandSetQuery>({
          query: GetCommandSetDocument,
          variables: {
            name: "1845_BMW_Project_2021.cmdset",
            revision: 1,
          } as GetCommandSetQueryVariables,

          fetchPolicy: "no-cache",
        });

        expect(queryResult.data.getCommandSet).toBeDefined();
        expect(queryResult.data.getCommandSet).not.toBeNull();

        expect(queryResult.data.getCommandSet).toEqual({
          commands: {
            ActivatePeriodicMessages: { parameters: {} },
            ActiveDiagnosticSession: { parameters: { session: { type: "U8", direction: "OUTPUT" } } },
            AdcOverride: {
              parameters: {
                option: { type: "U8", direction: "INPUT" },
                channel: { type: "U8", direction: "INPUT" },
                valueIn: { type: "U16", direction: "INPUT" },
                valueOut: { type: "U16", direction: "OUTPUT" },
              },
            },
            AgcOverrideSetting: { parameters: { setting: { type: "U8", direction: "MEMORY" } } },
            AmbientAlsValues: {
              parameters: {
                ambientOffset: { type: "U16", direction: "MEMORY" },
                ambientCal: { type: "U16", direction: "MEMORY" },
                ambientChecksum: { type: "U8", direction: "MEMORY" },
              },
            },
            AmbientAlsValuesAuto: {
              parameters: {
                ambientOffset: { type: "U16", direction: "MEMORY" },
                ambientCal: { type: "U16", direction: "MEMORY" },
              },
            },
            AmbientLightLevel: {
              parameters: {
                ambientInstantaneous: { type: "U8", direction: "OUTPUT" },
                ambientAverage: { type: "U8", direction: "OUTPUT" },
                ambientInstantaneousHigh: { type: "U16", direction: "OUTPUT" },
              },
            },
            AmbientOverride: {
              parameters: {
                override: { type: "U8", direction: "MEMORY" },
                ambient: { type: "U16", direction: "MEMORY" },
              },
            },
            AppHardwareNumber: { parameters: { hardwareNumber: { type: "U8[11]", direction: "MEMORY" } } },
            AppHardwareVersion: { parameters: { hardwareVersion: { type: "U8[3]", direction: "MEMORY" } } },
            AppPartNumber: { parameters: { partNumber: { type: "U8[11]", direction: "MEMORY" } } },
            AssemblyPartNumber: { parameters: { partNumber: { type: "U16", direction: "MEMORY" } } },
            AssignFrameId: {
              parameters: {
                messageId: { type: "U16", direction: "INPUT" },
                frameId: { type: "U8", direction: "INPUT" },
                response: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            AssignNAD: {
              parameters: {
                supplierId: { type: "U16", direction: "INPUT" },
                functionId: { type: "U16", direction: "INPUT" },
                newNAD: { type: "U8", direction: "INPUT" },
              },
            },
            BRC_ILE_ALL_LIN: {
              parameters: {
                CTR_ILE_1_RDLP_RH_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_1_RDLP_LH_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_2_RDLP_RH_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_2_RDLP_LH_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_3_RDLP_RH_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_3_RDLP_LH_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_4_RDLP_RH_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_4_RDLP_LH_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_1_ITLI_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_2_ITLI_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_3_ITLI_LIN: { type: "F64", direction: "INPUT" },
                CTR_ILE_4_ITLI_LIN: { type: "F64", direction: "INPUT" },
                BRC_ILE_PUBU_RDLP_ITLI_LIN: { type: "F64", direction: "INPUT" },
                BRC_ILE_WELL_LIN: { type: "F64", direction: "INPUT" },
                BRC_ILE_PUBU_SOF_ON_OFF_LIN: { type: "F64", direction: "INPUT" },
                BRC_ILE_SOF_ON_OFF_LIN: { type: "F64", direction: "INPUT" },
                BRC_ILE_TARVL_BU_LIN: { type: "F64", direction: "INPUT" },
                BRC_ILE_TARVL_GE_LIN: { type: "F64", direction: "INPUT" },
                BRC_ILE_TARVL_RE_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            BRC_ILE_ALL_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "INPUT" } } },
            BRC_VEHDT_LIN: {
              parameters: {
                ST_PO_FLDT_CAB_LIN: { type: "F64", direction: "INPUT" },
                BRC_ST_KL_LIN: { type: "F64", direction: "INPUT" },
                BRC_V_VEH_COG_LIN: { type: "F64", direction: "INPUT" },
                BRC_CTR_ITLI_LIN: { type: "F64", direction: "INPUT" },
                BRC_ST_GR_GRB_LIN: { type: "F64", direction: "INPUT" },
                PWM_ILUM_SW_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            BRC_VEHDT_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "INPUT" } } },
            BmwNotConfigured: { parameters: { bmwNotConfigured: { type: "U8", direction: "MEMORY" } } },
            BmwPartNumber: { parameters: { bmwPartNumber: { type: "U8[5]", direction: "MEMORY" } } },
            BmwSerialNumber: { parameters: { bmwSerialNumber: { type: "U8[4]", direction: "MEMORY" } } },
            BootloadXmlFile: { parameters: { filepath: { type: "string", direction: "INPUT" } } },
            BuildNumber: { parameters: { buildNumber: { type: "U32", direction: "OUTPUT" } } },
            CODDT_00_RVMI_LIN: {
              parameters: {
                CODDT_00_SCAL_SEN_LIN: { type: "F64", direction: "INPUT" },
                CODDT_00_SCAL_SEN_DAZZ_00_LIN: { type: "F64", direction: "INPUT" },
                CODDT_00_SCAL_SEN_DAZZ_01_LIN: { type: "F64", direction: "INPUT" },
                CODDT_00_SCAL_SEN_DAZZ_02_LIN: { type: "F64", direction: "INPUT" },
                CODDT_00_FIL_CONST_LIN: { type: "F64", direction: "INPUT" },
                CTR_00_BRIG_DISP_TST_LIN: { type: "F64", direction: "INPUT" },
                CTR_00_DISP_TST_LIN: { type: "F64", direction: "INPUT" },
                CODDT_00_SCAL_DIM_ECR_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            CODDT_00_RVMI_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "INPUT" } } },
            CODDT_01_RVMI_LIN: {
              parameters: {
                CODDT_01_SCAL_SEN_LIN: { type: "F64", direction: "INPUT" },
                CODDT_01_SCAL_SEN_DAZZ_00_LIN: { type: "F64", direction: "INPUT" },
                CODDT_01_SCAL_SEN_DAZZ_01_LIN: { type: "F64", direction: "INPUT" },
                CODDT_01_SCAL_SEN_DAZZ_02_LIN: { type: "F64", direction: "INPUT" },
                CODDT_01_FIL_CONST_LIN: { type: "F64", direction: "INPUT" },
                CODDT_01_SCAL_DIM_ECR_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            CODDT_01_RVMI_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "INPUT" } } },
            COLLI: { parameters: {} },
            CON_VEH_ISP_LIN: { parameters: { CTR_BS_PRTNT_ISP_LIN: { type: "F64", direction: "INPUT" } } },
            CON_VEH_ISP_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            CalibrateAmbientAls: {
              parameters: {
                ambientLightLevel: { type: "F32", direction: "INPUT" },
                calculatedAmbientOffset: { type: "U16", direction: "OUTPUT" },
                calculatedAmbientCal: { type: "U16", direction: "OUTPUT" },
                success: { type: "U8", direction: "OUTPUT" },
              },
            },
            CalibrateGlareAls: {
              parameters: {
                glareLightLevel: { type: "F32", direction: "INPUT" },
                oneLuxTrip: { type: "F32", direction: "INPUT" },
                calculatedGlareOffset: { type: "U16", direction: "OUTPUT" },
                calculatedGlareCal: { type: "U8", direction: "OUTPUT" },
                success: { type: "U8", direction: "OUTPUT" },
              },
            },
            ChangePrndl: { parameters: { state: { type: "string", direction: "INPUT" } } },
            ChannelGlobalStatus: {
              parameters: {
                channelsTrained: { type: "U16", direction: "MEMORY" },
                channelsRolling: { type: "U16", direction: "MEMORY" },
                channelsTwc: { type: "U16", direction: "MEMORY" },
                channelsSync: { type: "U16", direction: "MEMORY" },
              },
            },
            ClearDTC: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            CommunicationControl: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            ConfigurationFileHeaderInfo: {
              parameters: {
                projectId: { type: "U32", direction: "OUTPUT" },
                formatId: { type: "U32", direction: "OUTPUT" },
                formatVersion: { type: "U32", direction: "OUTPUT" },
                buildDate: { type: "U32", direction: "OUTPUT" },
                buildTime: { type: "U32", direction: "OUTPUT" },
                partNumber: { type: "U8[15]", direction: "OUTPUT" },
              },
            },
            ConfigureSendCmdForDfltRcvr: { parameters: {} },
            ControlDTCs: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            CoreAlsBuildOptions: { parameters: { buildOptions: { type: "U8[]", direction: "OUTPUT" } } },
            CoreAlsSoftwareVersion: { parameters: { softwareVersion: { type: "string", direction: "OUTPUT" } } },
            CoreDebugSoftwareVersion: { parameters: { softwareVersion: { type: "string", direction: "OUTPUT" } } },
            CoreHomeLinkBuildOptions: { parameters: { buildOptions: { type: "U16", direction: "OUTPUT" } } },
            CoreHomeLinkSoftwareVersion: { parameters: { softwareVersion: { type: "string", direction: "OUTPUT" } } },
            CoreManufacturingSoftwareVersion: {
              parameters: { softwareVersion: { type: "string", direction: "OUTPUT" } },
            },
            CoreMemMgrBuildOptions: { parameters: { buildOptions: { type: "U8[]", direction: "OUTPUT" } } },
            CoreMemMgrSoftwareVersion: { parameters: { softwareVersion: { type: "string", direction: "OUTPUT" } } },
            CountryCode: { parameters: { country: { type: "U8", direction: "MEMORY" } } },
            DeactivatePeriodicMessages: { parameters: {} },
            DefaultPktInfo: { parameters: { code: { type: "U8", direction: "MEMORY" } } },
            DfltRcvrConnect: {
              parameters: {
                Timeout: { type: "U8", direction: "INPUT" },
                LowBand: { type: "U8", direction: "INPUT" },
                RcTable: { type: "U32", direction: "OUTPUT" },
              },
            },
            DfltRcvrDiagMode: { parameters: {} },
            DfltRcvrFlush: { parameters: {} },
            DfltRcvrRxCmd: {
              parameters: {
                Timeout: { type: "U16", direction: "INPUT" },
                Response: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            DfltRcvrRxRaw: { parameters: { Response: { type: "U8", direction: "OUTPUT" } } },
            DfltRcvrRxRawFirst: { parameters: { Response: { type: "U8", direction: "OUTPUT" } } },
            DfltRcvrSendCmd: {
              parameters: {
                Request: { type: "U8[]", direction: "INPUT" },
                Timeout: { type: "U16", direction: "INPUT" },
                Response: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            DfltRcvrTxCmd: { parameters: { Request: { type: "U8[]", direction: "INPUT" } } },
            DfltRcvrTxRaw: { parameters: { Request: { type: "U8[]", direction: "INPUT" } } },
            DiagnosticSessionControl: { parameters: { session: { type: "U8", direction: "INPUT" } } },
            ERR_ST_ISP: { parameters: {} },
            ERR_ST_RVMI_LIN: {
              parameters: {
                ERR_ST_USUP_RVMI_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_INTL_RVMI_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_SC_USUP_ECR_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_SC_GND_ECR_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_ECR_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_LP_SEN_ECR_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_SC_BTU_ETC_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_SC_GND_ETC_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_CODDT_RVMI_LIN: { type: "F64", direction: "OUTPUT" },
              },
            },
            ERR_ST_RVMI_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "OUTPUT" } } },
            ERR_ST_UGDO: { parameters: {} },
            ERR_ST_UGDO_LIN: {
              parameters: {
                ERR_ST_LVAL_UGDO_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_LVAL_FREQ_UGDO_LIN: { type: "F64", direction: "OUTPUT" },
                ERR_ST_LVAL_DOM_FREQ_UGDO_LIN: { type: "F64", direction: "OUTPUT" },
              },
            },
            ERR_ST_UGDO_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "OUTPUT" } } },
            EcDimnessCal: {
              parameters: {
                shuntingPeriod: { type: "U8", direction: "MEMORY" },
                dimmingPeriod: { type: "U8", direction: "MEMORY" },
                clearingPeriod: { type: "U8", direction: "MEMORY" },
                dimnessTable: { type: "U8[65]", direction: "MEMORY" },
                checksum: { type: "U8", direction: "MEMORY" },
              },
            },
            EcDimnessCalAuto: {
              parameters: {
                shuntingPeriod: { type: "U8", direction: "MEMORY" },
                dimmingPeriod: { type: "U8", direction: "MEMORY" },
                clearingPeriod: { type: "U8", direction: "MEMORY" },
                dimnessTable: { type: "U8[65]", direction: "MEMORY" },
              },
            },
            EcIndicator: {
              parameters: {
                dayPwm: { type: "U8", direction: "MEMORY" },
                nightPwm: { type: "U8", direction: "MEMORY" },
              },
            },
            EcPowerLimits: {
              parameters: {
                holdoff: { type: "U16", direction: "MEMORY" },
                iecConductance: { type: "U16", direction: "MEMORY" },
                oecConductance: { type: "U16", direction: "MEMORY" },
                iecPowerLimit: { type: "U8", direction: "MEMORY" },
                oecPowerLimit: { type: "U8", direction: "MEMORY" },
                clampPowerLimit: { type: "U8", direction: "MEMORY" },
                updatePeriod: { type: "U8", direction: "MEMORY" },
                clampCurrent: { type: "U8", direction: "MEMORY" },
                diodeVoltage: { type: "U8", direction: "MEMORY" },
              },
            },
            EcPowerLimitsAuto: {
              parameters: {
                holdoff: { type: "F32", direction: "MEMORY" },
                iecResistance: { type: "F32", direction: "MEMORY" },
                oecResistance: { type: "F32", direction: "MEMORY" },
                iecPowerLimit: { type: "F32", direction: "MEMORY" },
                oecPowerLimit: { type: "F32", direction: "MEMORY" },
                clampPowerLimit: { type: "F32", direction: "MEMORY" },
                timeConstant: { type: "F32", direction: "MEMORY" },
                clampCurrent: { type: "F32", direction: "MEMORY" },
                diodeVoltage: { type: "F32", direction: "MEMORY" },
              },
            },
            EcThermalLimits: {
              parameters: {
                overTempStop: { type: "U8", direction: "MEMORY" },
                overTempResume: { type: "U8", direction: "MEMORY" },
              },
            },
            EcuReset: { parameters: { reset: { type: "U8", direction: "INPUT" } } },
            EnableDiagnosticMessages: { parameters: {} },
            EnterBootloader: { parameters: {} },
            EnterUdsBootloader: { parameters: {} },
            EraseChannels: { parameters: {} },
            ErrorStatus: {
              parameters: {
                errorStatus: { type: "U8", direction: "OUTPUT" },
                statusCode: { type: "U32", direction: "OUTPUT" },
              },
            },
            ErrorStatusReasons: { parameters: { descriptions: { type: "string[11]", direction: "OUTPUT" } } },
            ExternalAntennaStatus: {
              parameters: { status: { type: "U8", direction: "OUTPUT" }, charge: { type: "U16", direction: "OUTPUT" } },
            },
            ExternalAntennaThresholds: {
              parameters: {
                openThreshold: { type: "U16", direction: "MEMORY" },
                shortedThreshold: { type: "U16", direction: "MEMORY" },
              },
            },
            FhssTest: { parameters: { channel: { type: "U8", direction: "INPUT" } } },
            FirmwareAssemblyPartNumbers: {
              parameters: {
                programId: { type: "string", direction: "OUTPUT" },
                bootloader: { type: "string", direction: "OUTPUT" },
                application: { type: "string", direction: "OUTPUT" },
                configuration: { type: "string", direction: "OUTPUT" },
                userRow: { type: "string", direction: "OUTPUT" },
              },
            },
            FirmwarePartNumbersCrc32: {
              parameters: {
                programId: { type: "U8[]", direction: "OUTPUT" },
                crc32: { type: "U32", direction: "OUTPUT" },
              },
            },
            FirmwarePartNumbersRaw: { parameters: { partNumbers: { type: "U8[]", direction: "OUTPUT" } } },
            FrameId: {
              parameters: {
                NAD: { type: "U8", direction: "MEMORY" },
                BRC_VEHDT_LIN: { type: "U8", direction: "MEMORY" },
                CODDT_01_RVMI_LIN: { type: "U8", direction: "MEMORY" },
                CON_VEH_ISP_LIN: { type: "U8", direction: "MEMORY" },
                ERR_ST_RVMI_LIN: { type: "U8", direction: "MEMORY" },
                ERR_ST_UGDO_LIN: { type: "U8", direction: "MEMORY" },
                ST_RVMI_LIN: { type: "U8", direction: "MEMORY" },
                ST_UGDO_LIN: { type: "U8", direction: "MEMORY" },
                SU_RVMI_LIN: { type: "U8", direction: "MEMORY" },
                SU_UGDO_LIN: { type: "U8", direction: "MEMORY" },
                StatusUGDO2LIN: { type: "U8", direction: "MEMORY" },
              },
            },
            GatherProfilingResults: { parameters: { filename: { type: "string", direction: "INPUT" } } },
            GentexSpecificSerialNumber: { parameters: { serialNumber: { type: "U8[8]", direction: "MEMORY" } } },
            GetInterruptProfilingResults: {
              parameters: {
                interruptId: { type: "U16", direction: "INPUT" },
                numCyclesHigh: { type: "U32", direction: "OUTPUT" },
                numCyclesLow: { type: "U32", direction: "OUTPUT" },
                totalTimeHigh: { type: "U32", direction: "OUTPUT" },
                totalTimeLow: { type: "U32", direction: "OUTPUT" },
                totalCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                totalCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                shortestCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                shortestCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                longestCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                longestCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                shortestCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                shortestCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
                longestCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                longestCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
                avgCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                avgCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
              },
            },
            GetMeasurementProfilingResults: {
              parameters: {
                measurementId: { type: "U16", direction: "INPUT" },
                numCyclesHigh: { type: "U32", direction: "OUTPUT" },
                numCyclesLow: { type: "U32", direction: "OUTPUT" },
                totalTimeHigh: { type: "U32", direction: "OUTPUT" },
                totalTimeLow: { type: "U32", direction: "OUTPUT" },
                totalCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                totalCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                shortestCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                shortestCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                longestCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                longestCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                shortestCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                shortestCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
                longestCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                longestCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
                avgCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                avgCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
              },
            },
            GetOecPwm: {
              parameters: { pwm: { type: "U8", direction: "OUTPUT" }, unused: { type: "U8", direction: "OUTPUT" } },
            },
            GetOverallProfilingResults: {
              parameters: {
                totalElapsedTimeHigh: { type: "U32", direction: "OUTPUT" },
                totalElapsedTimeLow: { type: "U32", direction: "OUTPUT" },
                totalTimeUtilsElapsedTimeHigh: { type: "U32", direction: "OUTPUT" },
                totalTimeUtilsElapsedTimeLow: { type: "U32", direction: "OUTPUT" },
                interruptCountHigh: { type: "U32", direction: "OUTPUT" },
                interruptCountLow: { type: "U32", direction: "OUTPUT" },
                interruptTimeHigh: { type: "U32", direction: "OUTPUT" },
                interruptTimeLow: { type: "U32", direction: "OUTPUT" },
                errors: { type: "U16", direction: "OUTPUT" },
              },
            },
            GetPrndlStates: { parameters: { states: { type: "string[2]", direction: "OUTPUT" } } },
            GetSignalFromMessage: {
              parameters: {
                bytesIn: { type: "U8[]", direction: "INPUT" },
                scaleOffset: { type: "F64", direction: "INPUT" },
                scaleFactor: { type: "F64", direction: "INPUT" },
                startBit: { type: "U8", direction: "INPUT" },
                bitLength: { type: "U8", direction: "INPUT" },
                byteOrder: { type: "U8", direction: "INPUT" },
                valueOut: { type: "F64", direction: "OUTPUT" },
              },
            },
            GetTaskProfilingResults: {
              parameters: {
                taskId: { type: "U16", direction: "INPUT" },
                numCyclesHigh: { type: "U32", direction: "OUTPUT" },
                numCyclesLow: { type: "U32", direction: "OUTPUT" },
                totalTimeHigh: { type: "U32", direction: "OUTPUT" },
                totalTimeLow: { type: "U32", direction: "OUTPUT" },
                totalCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                totalCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                shortestCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                shortestCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                longestCycleTimeHigh: { type: "U32", direction: "OUTPUT" },
                longestCycleTimeLow: { type: "U32", direction: "OUTPUT" },
                shortestCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                shortestCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
                longestCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                longestCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
                avgCyclePeriodHigh: { type: "U32", direction: "OUTPUT" },
                avgCyclePeriodLow: { type: "U32", direction: "OUTPUT" },
              },
            },
            GlareAlsValues: {
              parameters: {
                glareOffset: { type: "U16", direction: "MEMORY" },
                glareCal: { type: "U8", direction: "MEMORY" },
                glareChecksum: { type: "U8", direction: "MEMORY" },
              },
            },
            GlareAlsValuesAuto: {
              parameters: {
                glareOffset: { type: "U16", direction: "MEMORY" },
                glareCal: { type: "U8", direction: "MEMORY" },
              },
            },
            GlareHighScaleFactor: { parameters: { glareHighScaleFactor: { type: "U8", direction: "MEMORY" } } },
            GlareLightLevel: {
              parameters: {
                glareInstantaneous: { type: "U8", direction: "OUTPUT" },
                iecPwm: { type: "U8", direction: "OUTPUT" },
                glareInstantaneousHigh: { type: "U8", direction: "OUTPUT" },
                oecPwm: { type: "U8", direction: "OUTPUT" },
              },
            },
            GlareOverride: {
              parameters: {
                override: { type: "U8", direction: "MEMORY" },
                glare: { type: "U8", direction: "MEMORY" },
                glareHigh: { type: "U8", direction: "MEMORY" },
              },
            },
            GpioOverride: {
              parameters: {
                option: { type: "U8", direction: "INPUT" },
                portId: { type: "U8", direction: "INPUT" },
                pinId: { type: "U8", direction: "INPUT" },
                stateIn: { type: "U8", direction: "INPUT" },
                stateOut: { type: "U8", direction: "OUTPUT" },
              },
            },
            HandleDiagnosticRoutine: {
              parameters: {
                moduleId: { type: "U8", direction: "INPUT" },
                commandId: { type: "U8", direction: "INPUT" },
                type: { type: "U8", direction: "INPUT" },
                requestData: { type: "U8[]", direction: "INPUT" },
                timeout: { type: "U16", direction: "INPUT" },
                responseData: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            HardwareReferenceNumber: {
              parameters: { hardwareReferenceNumber: { type: "U8[2]", direction: "MEMORY" } },
            },
            HlUiBuildOptions: {
              parameters: {
                buildOptions: { type: "string", direction: "OUTPUT" },
                buttonSelect: { type: "string", direction: "OUTPUT" },
                inhibitSelect: { type: "string", direction: "OUTPUT" },
                ledSelect: { type: "string", direction: "OUTPUT" },
                statusInSelect: { type: "string", direction: "OUTPUT" },
                statusOutSelect: { type: "string", direction: "OUTPUT" },
                commandControlSelect: { type: "string", direction: "OUTPUT" },
                powerSelect: { type: "string", direction: "OUTPUT" },
              },
            },
            HlUiHoldPowerOn: { parameters: { holdPowerOn: { type: "U8", direction: "MEMORY" } } },
            HlUiOverrideInhibit: {
              parameters: {
                option: { type: "U8", direction: "INPUT" },
                inhibitLevel: { type: "U8", direction: "INPUT" },
              },
            },
            HlUiOverrideStatus: {
              parameters: {
                option: { type: "U8", direction: "INPUT" },
                status: { type: "U8", direction: "INPUT" },
                twStatus: { type: "U8", direction: "INPUT" },
                channel: { type: "U8", direction: "INPUT" },
              },
            },
            HlUiReadButtonStatus: { parameters: { buttonStatus: { type: "U8", direction: "OUTPUT" } } },
            HlUiReadHomeLinkStatus: {
              parameters: {
                status: { type: "U8", direction: "OUTPUT" },
                twStatus: { type: "U8", direction: "OUTPUT" },
                channel: { type: "U8", direction: "OUTPUT" },
              },
            },
            HlUiSimulateButtonPress: {
              parameters: { option: { type: "U8", direction: "INPUT" }, buttonIn: { type: "U8", direction: "INPUT" } },
            },
            HlUiSoftwareVersion: { parameters: { softwareVersion: { type: "string", direction: "OUTPUT" } } },
            IOControl: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            IctPartNumber: { parameters: { partNumber: { type: "U16", direction: "MEMORY" } } },
            IdleMode: { parameters: {} },
            IecState: {
              parameters: {
                iecState: { type: "U8", direction: "MEMORY" },
                overridePwm: { type: "U8", direction: "MEMORY" },
              },
            },
            IecTable: {
              parameters: {
                iecTable: { type: "U8[23]", direction: "MEMORY" },
                checksum: { type: "U8", direction: "MEMORY" },
              },
            },
            IecTableAuto: { parameters: { iecTable: { type: "U8[23]", direction: "MEMORY" } } },
            LinSleep: { parameters: {} },
            ManufacturingTestMode: { parameters: {} },
            MeaPartNumber: { parameters: { partNumber: { type: "U16", direction: "MEMORY" } } },
            MemMgrDumpAllToCsv: { parameters: { path: { type: "string", direction: "INPUT" } } },
            MemMgrEraseAll: { parameters: {} },
            MemMgrWritesComplete: { parameters: { maxWaitTimeSeconds: { type: "U16", direction: "INPUT" } } },
            MemMgrWritesStatus: {
              parameters: {
                pendingCount: { type: "U8", direction: "OUTPUT" },
                pendingBytes: { type: "U8", direction: "OUTPUT" },
              },
            },
            MfgAndVehicleSimSchedule: { parameters: {} },
            MfgOpsManagerPartNumber: {
              parameters: {
                major: { type: "U16[1]", direction: "MEMORY" },
                minor: { type: "U8", direction: "MEMORY" },
                revision: { type: "U8[3]", direction: "MEMORY" },
                version: { type: "U8", direction: "MEMORY" },
              },
            },
            NumTimesTestedCombo: { parameters: { tested: { type: "U8", direction: "MEMORY" } } },
            NumTimesTestedEol: { parameters: { tested: { type: "U8", direction: "MEMORY" } } },
            NumTimesTestedHelm: { parameters: { tested: { type: "U8", direction: "MEMORY" } } },
            NumTimesTestedIct: { parameters: { tested: { type: "U8", direction: "MEMORY" } } },
            NumTimesTestedIleft: { parameters: { tested: { type: "U8", direction: "MEMORY" } } },
            NumTimesTestedMea: { parameters: { tested: { type: "U8", direction: "MEMORY" } } },
            NumTimesTestedSpare: { parameters: { tested: { type: "U8", direction: "MEMORY" } } },
            OecState: {
              parameters: {
                oecState: { type: "U8", direction: "MEMORY" },
                overridePwm: { type: "U8", direction: "MEMORY" },
              },
            },
            OecTable: {
              parameters: {
                oecTable: { type: "U8[23]", direction: "MEMORY" },
                checksum: { type: "U8", direction: "MEMORY" },
              },
            },
            OecTableAuto: { parameters: { oecTable: { type: "U8[23]", direction: "MEMORY" } } },
            OnlyISPFrames: { parameters: {} },
            PowerTargetChina: {
              parameters: {
                powerRegion0: { type: "U8", direction: "MEMORY" },
                powerRegion1: { type: "U8", direction: "MEMORY" },
                powerRegion2: { type: "U8", direction: "MEMORY" },
              },
            },
            PowerTargetGlobal: {
              parameters: {
                powerRegion0: { type: "U8", direction: "MEMORY" },
                powerRegion1: { type: "U8", direction: "MEMORY" },
                powerRegion2: { type: "U8", direction: "MEMORY" },
                powerRegion3: { type: "U8", direction: "MEMORY" },
                powerRegion4: { type: "U8", direction: "MEMORY" },
              },
            },
            PowerTargetNa: {
              parameters: {
                powerRegion0: { type: "S8[3]", direction: "MEMORY" },
                powerRegion1: { type: "S8[3]", direction: "MEMORY" },
                powerRegion2: { type: "S8[3]", direction: "MEMORY" },
                powerRegion3: { type: "S8[3]", direction: "MEMORY" },
                powerRegion4: { type: "S8[3]", direction: "MEMORY" },
                powerRegion5: { type: "S8[3]", direction: "MEMORY" },
                powerRegionFhss: { type: "S8[3]", direction: "MEMORY" },
              },
            },
            ProductionDate: {
              parameters: {
                year: { type: "U8", direction: "MEMORY" },
                month: { type: "U8", direction: "MEMORY" },
                day: { type: "U8", direction: "MEMORY" },
              },
            },
            ProgramAttemptsCounter: {
              parameters: {
                bootloader: { type: "U8[]", direction: "OUTPUT" },
                application: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            ProgrammingDate: { parameters: { date: { type: "U8[3]", direction: "MEMORY" } } },
            PsRadioXcvrClearPropOverride: {
              parameters: {
                propertyGroup: { type: "U8", direction: "INPUT" },
                propertyIndex: { type: "U8", direction: "INPUT" },
              },
            },
            PsRadioXcvrCmd: {
              parameters: {
                clearToSend: { type: "U8", direction: "INPUT" },
                respLen: { type: "U8", direction: "INPUT" },
                request: { type: "U8[]", direction: "INPUT" },
                response: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            PsRadioXcvrGetProp: {
              parameters: {
                propertyGroup: { type: "U8", direction: "INPUT" },
                propertyIndex: { type: "U8", direction: "INPUT" },
                propertyValue: { type: "U8", direction: "OUTPUT" },
              },
            },
            PsRadioXcvrPartInfo: {
              parameters: {
                chipRev: { type: "U8", direction: "OUTPUT" },
                part: { type: "U16", direction: "OUTPUT" },
                pBuild: { type: "U8", direction: "OUTPUT" },
                id: { type: "U16", direction: "OUTPUT" },
                customer: { type: "U8", direction: "OUTPUT" },
                romId: { type: "U8", direction: "OUTPUT" },
              },
            },
            PsRadioXcvrSetProp: {
              parameters: {
                propertyGroup: { type: "U8", direction: "INPUT" },
                propertyIndex: { type: "U8", direction: "INPUT" },
                propertyValue: { type: "U8", direction: "INPUT" },
              },
            },
            PsRadioXcvrSetPropOverride: {
              parameters: {
                propertyGroup: { type: "U8", direction: "INPUT" },
                propertyIndex: { type: "U8", direction: "INPUT" },
                propertyValue: { type: "U8", direction: "INPUT" },
              },
            },
            PsRadioXcvrVersion: { parameters: { version: { type: "string", direction: "OUTPUT" } } },
            PulseAmbient: {
              parameters: {
                integrationPulse: { type: "U16", direction: "INPUT" },
                offset: { type: "U16", direction: "OUTPUT" },
                returnPulse: { type: "U16", direction: "OUTPUT" },
                preDelay: { type: "U16", direction: "OUTPUT" },
              },
            },
            PulseGlare: {
              parameters: {
                integrationPulse: { type: "U16", direction: "INPUT" },
                offset: { type: "U16", direction: "OUTPUT" },
                returnPulse: { type: "U16", direction: "OUTPUT" },
                preDelay: { type: "U16", direction: "OUTPUT" },
              },
            },
            PwfConfiguration: { parameters: { pwfConfiguration: { type: "U8", direction: "MEMORY" } } },
            RUN_MAIN_CYC: { parameters: {} },
            RamAlsErrorRegister: { parameters: { errorRegister: { type: "U16", direction: "OUTPUT" } } },
            RamReadAlsCalData: {
              parameters: {
                ambientOffset: { type: "U16", direction: "OUTPUT" },
                ambientCal: { type: "U16", direction: "OUTPUT" },
                glareOffset: { type: "U16", direction: "OUTPUT" },
                glareCal: { type: "U8", direction: "OUTPUT" },
              },
            },
            RamReadEcStatus: { parameters: { ecStatus: { type: "U16", direction: "OUTPUT" } } },
            RangeChecking: { parameters: { rangeChecking: { type: "U8", direction: "MEMORY" } } },
            ReadAdc: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                reading: { type: "U16", direction: "OUTPUT" },
              },
            },
            ReadById: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            ReadByIdentifier: {
              parameters: {
                identifier: { type: "U8", direction: "INPUT" },
                supplierId: { type: "U16", direction: "INPUT" },
                functionId: { type: "U16", direction: "INPUT" },
                response: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            ReadChannelDataDynamic: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                offset: { type: "U8", direction: "INPUT" },
                numBytes: { type: "U8", direction: "INPUT" },
                data: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            ReadChannelDataStatic: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                offset: { type: "U8", direction: "INPUT" },
                numBytes: { type: "U8", direction: "INPUT" },
                data: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            ReadChannelWarrantyData: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                transmitCount: { type: "U16", direction: "OUTPUT" },
                trainStartCount: { type: "U8", direction: "OUTPUT" },
                trainSuccessCount: { type: "U8", direction: "OUTPUT" },
                trainTimeoutCount: { type: "U8", direction: "OUTPUT" },
                stuckButtonCount: { type: "U8", direction: "OUTPUT" },
              },
            },
            ReadDTC: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            ReadEcDimness: { parameters: { dimness: { type: "U8", direction: "OUTPUT" } } },
            ReadI2c: {
              parameters: {
                slaveAddr: { type: "U8", direction: "INPUT" },
                regAddr: { type: "U8[]", direction: "INPUT" },
                numBytes: { type: "U8", direction: "INPUT" },
                data: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            ReadMem: {
              parameters: {
                address: { type: "U32", direction: "INPUT" },
                size: { type: "U16", direction: "INPUT" },
                data: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            ReadPowerTargetNa: {
              parameters: {
                dutyCycleIndex: { type: "U8", direction: "INPUT" },
                powerRegion0: { type: "S8", direction: "OUTPUT" },
                powerRegion1: { type: "S8", direction: "OUTPUT" },
                powerRegion2: { type: "S8", direction: "OUTPUT" },
                powerRegion3: { type: "S8", direction: "OUTPUT" },
                powerRegion4: { type: "S8", direction: "OUTPUT" },
                powerRegion5: { type: "S8", direction: "OUTPUT" },
                powerRegionFhss: { type: "S8", direction: "OUTPUT" },
              },
            },
            ReadVariantId: {
              parameters: {
                supplierId: { type: "U16", direction: "INPUT" },
                functionId: { type: "U16", direction: "INPUT" },
                variantId: { type: "U8", direction: "OUTPUT" },
              },
            },
            ReceiveMode: {
              parameters: {
                frequency: { type: "U32", direction: "INPUT" },
                rssiThreshold: { type: "U8", direction: "INPUT" },
                frequencyDeviation: { type: "U8", direction: "INPUT" },
              },
            },
            RecordNumber: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                recordNumber: { type: "U32", direction: "OUTPUT" },
              },
            },
            RepairShopCode: { parameters: { code: { type: "U8[6]", direction: "MEMORY" } } },
            RequestDownload: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            RequestFileTransfer: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            RequestSilentMode: { parameters: {} },
            RequestTransferExit: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            RequestUpload: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            RfAsicOscLoadCap: { parameters: { value: { type: "U8", direction: "MEMORY" } } },
            RfCompatabilityLevel: { parameters: { compatabilityLevel: { type: "U8", direction: "OUTPUT" } } },
            RoutineControl: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            RssiThresholdOffset: { parameters: { offset: { type: "U8", direction: "MEMORY" } } },
            ST_ILE_2_LIN: {
              parameters: {
                ST_RDLP_ILE_2_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_ITLI_ILE_2_LIN: { type: "F64", direction: "INPUT" },
                ST_RDLP_ILE_2_LH_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_ITLI_ILE_2_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_AMBI_LP_ILE_2_LIN: { type: "F64", direction: "INPUT" },
                ST_AMBI_LP_ILE_2_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_WELL_ILE_2_LIN: { type: "F64", direction: "INPUT" },
                ST_WELL_ILE_2_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_RDLP_ILE_2_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_2_RH_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_RDLP_ILE_2_LH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_2_LH_LIN: { type: "F64", direction: "INPUT" },
                COMM_ERR_ILE_2_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_ILE_2_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_OTMP_ILE_2_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            ST_ILE_2_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            ST_ILE_3_LIN: {
              parameters: {
                ST_RDLP_ILE_3_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_ITLI_ILE_3_LIN: { type: "F64", direction: "INPUT" },
                ST_RDLP_ILE_3_LH_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_ITLI_ILE_3_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_AMBI_LP_ILE_3_LIN: { type: "F64", direction: "INPUT" },
                ST_AMBI_LP_ILE_3_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_WELL_ILE_3_LIN: { type: "F64", direction: "INPUT" },
                ST_WELL_ILE_3_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_RDLP_ILE_3_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_3_RH_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_RDLP_ILE_3_LH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_3_LH_LIN: { type: "F64", direction: "INPUT" },
                COMM_ERR_ILE_3_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_ILE_3_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_OTMP_ILE_3_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            ST_ILE_3_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            ST_ILE_4_LIN: {
              parameters: {
                ST_RDLP_ILE_4_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_ITLI_ILE_4_LIN: { type: "F64", direction: "INPUT" },
                ST_RDLP_ILE_4_LH_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_ITLI_ILE_4_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_AMBI_LP_ILE_4_LIN: { type: "F64", direction: "INPUT" },
                ST_AMBI_LP_ILE_4_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_WELL_ILE_4_LIN: { type: "F64", direction: "INPUT" },
                ST_WELL_ILE_4_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_RDLP_ILE_4_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_4_RH_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_RDLP_ILE_4_LH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_4_LH_LIN: { type: "F64", direction: "INPUT" },
                COMM_ERR_ILE_4_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_ILE_4_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_OTMP_ILE_4_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            ST_ILE_4_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            ST_ILE_LIN: {
              parameters: {
                ST_RDLP_FS_LH_LIN: { type: "F64", direction: "INPUT" },
                ST_RDLP_FS_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_FS_LH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_FS_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_ITLI_FS_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_ILE_LIN: { type: "F64", direction: "INPUT" },
                COMM_ERR_ILE_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_OTMP_ILE_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_ITLI_FS_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_RDLP_FS_LH_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_RDLP_FS_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_TOG_ILE_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_WELL_FS_LIN: { type: "F64", direction: "INPUT" },
                ST_WELL_FS_LIN: { type: "F64", direction: "INPUT" },
                ST_AMBI_LP_FS_LIN: { type: "F64", direction: "INPUT" },
                ERR_ST_AMBI_LP_FS_LIN: { type: "F64", direction: "INPUT" },
                StatusPushButtonInteriorLight: { type: "F64", direction: "INPUT" },
                StatusPuBuMenuInteriorLightLIN: { type: "F64", direction: "INPUT" },
              },
            },
            ST_ILE_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "INPUT" } } },
            ST_PUBU_ILE_1_LIN: {
              parameters: {
                ST_PUBU_RDLP_FS_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_FS_LH_LIN: { type: "F64", direction: "INPUT" },
                StatusPushButtonInteriorLight: { type: "F64", direction: "INPUT" },
                StatusPuBuMenuInteriorLightLIN: { type: "F64", direction: "INPUT" },
              },
            },
            ST_PUBU_ILE_1_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            ST_PUBU_ILE_2_LIN: {
              parameters: {
                ST_PUBU_RDLP_ILE_2_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_2_LH_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            ST_PUBU_ILE_2_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            ST_PUBU_ILE_3_LIN: {
              parameters: {
                ST_PUBU_RDLP_ILE_3_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_3_LH_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            ST_PUBU_ILE_3_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            ST_PUBU_ILE_4_LIN: {
              parameters: {
                ST_PUBU_RDLP_ILE_4_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_ILE_4_LH_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            ST_PUBU_ILE_4_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            ST_RVMI_LIN: {
              parameters: {
                CTR_ECR_DIP_RVMI_LIN: { type: "F64", direction: "OUTPUT" },
                NOD_ERR_RVMI_LIN: { type: "F64", direction: "OUTPUT" },
                COMM_ERR_RVMI_LIN: { type: "F64", direction: "OUTPUT" },
              },
            },
            ST_RVMI_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "OUTPUT" } } },
            ST_UGDO_LIN: {
              parameters: {
                NOD_ERR_UGDO_LIN: { type: "F64", direction: "OUTPUT" },
                ST_BUT_UGDO_LIN: { type: "F64", direction: "OUTPUT" },
                ST_UGDO_LIN: { type: "F64", direction: "OUTPUT" },
                ST_LED_UGDO_LIN: { type: "F64", direction: "OUTPUT" },
                COMM_ERR_UGDO_LIN: { type: "F64", direction: "OUTPUT" },
              },
            },
            ST_UGDO_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "OUTPUT" } } },
            SU_ILE_ALL: { parameters: {} },
            SU_ILE_ALL_LIN: {
              parameters: {
                SU_ILE_STPN_PWRU_RDLP_LIN: { type: "F64", direction: "INPUT" },
                SU_ILE_STPN_PWRD_RDLP_LIN: { type: "F64", direction: "INPUT" },
                SU_ILE_STPN_PWRU_PUBU_RDLP_LIN: { type: "F64", direction: "INPUT" },
                SU_ILE_STPN_PWRD_PUBU_RDLP_LIN: { type: "F64", direction: "INPUT" },
                SU_ILE_PUT_PDT_WELL_LIN: { type: "F64", direction: "INPUT" },
                SU_ILE_LIM_WELL_LIN: { type: "F64", direction: "INPUT" },
                SU_ILE_BRIG_LP_INTR_LIN: { type: "F64", direction: "INPUT" },
                SU_ILE_BRIG_LP_COMM_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            SU_ILE_ALL_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "INPUT" } } },
            SU_ISP: { parameters: {} },
            SU_RVMI_LIN: {
              parameters: {
                CTR_ECR_RVMI_LIN: { type: "F64", direction: "INPUT" },
                CODDT_TYP_RSCR_LIN: { type: "F64", direction: "INPUT" },
                CODDT_SWO_BRIG_INTR_LP_LIN: { type: "F64", direction: "INPUT" },
                CODDT_KL_PWF_LIN: { type: "F64", direction: "INPUT" },
              },
            },
            SU_RVMI_LIN_Raw: { parameters: { payload: { type: "U8[8]", direction: "INPUT" } } },
            SU_UGDO: { parameters: {} },
            SU_UGDO_LIN: {
              parameters: {
                SU_CNT_UGDO_LIN: { type: "F64", direction: "INPUT" },
                VLT_MOD_ST_LIN: { type: "F64", direction: "INPUT" },
                HME_ILK_LIN: { type: "F64", direction: "INPUT" },
                DemandUGDOProhibitorLIN: { type: "F64", direction: "INPUT" },
                DemandTriggerLIN: { type: "F64", direction: "INPUT" },
                TimeConfigurationUGDOLIN: { type: "F64", direction: "INPUT" },
              },
            },
            SU_UGDO_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            SYS_EVT_LIN: {
              parameters: {
                ST_PUBU_RDLP_FS_RH_LIN: { type: "F64", direction: "INPUT" },
                ST_PUBU_RDLP_FS_LH_LIN: { type: "F64", direction: "INPUT" },
                StatusPushButtonInteriorLight: { type: "F64", direction: "INPUT" },
                StatusPuBuMenuInteriorLightLIN: { type: "F64", direction: "INPUT" },
              },
            },
            SYS_EVT_LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "INPUT" } } },
            ScanFrequency: {
              parameters: {
                frequency: { type: "U32", direction: "INPUT" },
                bandwidth: { type: "U8", direction: "INPUT" },
                rssi: { type: "U8", direction: "OUTPUT" },
              },
            },
            SelfTest: {
              parameters: {
                exclusionMask: { type: "U32", direction: "INPUT" },
                results: { type: "U32", direction: "OUTPUT" },
              },
            },
            SelfTestGetResult: {
              parameters: { testId: { type: "U32", direction: "INPUT" }, result: { type: "U8", direction: "OUTPUT" } },
            },
            SendCmd: {
              parameters: {
                cmd: { type: "U8[]", direction: "INPUT" },
                timeout: { type: "U16", direction: "INPUT" },
                response: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            SetEcState: {
              parameters: {
                ecState: { type: "U8", direction: "INPUT" },
                overridePwm: { type: "U8", direction: "INPUT" },
              },
            },
            SetReverse: {
              parameters: { override: { type: "U8", direction: "INPUT" }, reverse: { type: "U8", direction: "INPUT" } },
            },
            SoftwareBlockLockValue: {
              parameters: {
                bootloader: { type: "U8[]", direction: "OUTPUT" },
                application: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            SoftwareCompileDateTime: {
              parameters: {
                compileDate: { type: "string", direction: "OUTPUT" },
                compileTime: { type: "string", direction: "OUTPUT" },
              },
            },
            SpiOverride: {
              parameters: {
                chipSelect: { type: "U8", direction: "INPUT" },
                writeData: { type: "U8[]", direction: "INPUT" },
                readData: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            StackUse: {
              parameters: {
                taskId: { type: "U16", direction: "INPUT" },
                allocatedStack: { type: "U16", direction: "OUTPUT" },
                currentUsedStack: { type: "U16", direction: "OUTPUT" },
                maxUsedStack: { type: "U16", direction: "OUTPUT" },
              },
            },
            StartFccTest: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                frequency: { type: "U32", direction: "INPUT" },
                dutyCycle: { type: "U8", direction: "INPUT" },
                duration: { type: "U8", direction: "INPUT" },
              },
            },
            StartProfiling: { parameters: {} },
            StartSchedule: { parameters: { schedule: { type: "string", direction: "INPUT" } } },
            StatusUGDO2LIN: {
              parameters: {
                StatusReservedButtonsUGDOLin: { type: "F64", direction: "OUTPUT" },
                StatusTriggerUGDOLin: { type: "F64", direction: "OUTPUT" },
              },
            },
            StatusUGDO2LIN_Raw: { parameters: { payload: { type: "U8[2]", direction: "OUTPUT" } } },
            StopFccTest: { parameters: {} },
            StopProfiling: { parameters: {} },
            StopRoutineControl: { parameters: {} },
            SubAssemblyPartNumber: { parameters: { partNumber: { type: "U16", direction: "MEMORY" } } },
            SystemName: { parameters: { systemName: { type: "U8[13]", direction: "MEMORY" } } },
            TaskName: {
              parameters: {
                taskId: { type: "U16", direction: "INPUT" },
                taskName: { type: "string", direction: "OUTPUT" },
              },
            },
            TestStatus: {
              parameters: {
                statusHighByte: { type: "U8", direction: "MEMORY" },
                statusLowByte: { type: "U8", direction: "MEMORY" },
              },
            },
            TesterPresent: { parameters: { cmd: { type: "U8[]", direction: "INPUT" } } },
            TransferData: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "INPUT" } },
            },
            TransmitChannel: { parameters: { channel: { type: "U8", direction: "INPUT" } } },
            TransmitCw: {
              parameters: {
                frequency: { type: "U32", direction: "INPUT" },
                power: { type: "U8", direction: "INPUT" },
                antenna: { type: "U8", direction: "INPUT" },
              },
            },
            TransmitFccTest: {
              parameters: { channel: { type: "U8", direction: "INPUT" }, duration: { type: "U8", direction: "INPUT" } },
            },
            TwoWayEnable: { parameters: { state: { type: "U8", direction: "MEMORY" } } },
            TxLin: {
              parameters: {
                cmd: { type: "U8[]", direction: "INPUT" },
                response: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            UpTime: { parameters: { elapsedMs: { type: "U32", direction: "OUTPUT" } } },
            UpdateSignalInMessage: {
              parameters: {
                bytesIn: { type: "U8[]", direction: "INPUT" },
                newValue: { type: "F64", direction: "INPUT" },
                scaleOffset: { type: "F64", direction: "INPUT" },
                scaleFactor: { type: "F64", direction: "INPUT" },
                startBit: { type: "U8", direction: "INPUT" },
                bitLength: { type: "U8", direction: "INPUT" },
                byteOrder: { type: "U8", direction: "INPUT" },
                bytesOut: { type: "U8[]", direction: "OUTPUT" },
              },
            },
            VariantId: { parameters: { variantId: { type: "U8", direction: "MEMORY" } } },
            VoltageThreshold: {
              parameters: {
                lowVoltageStop: { type: "U8", direction: "MEMORY" },
                lowVoltageResume: { type: "U8", direction: "MEMORY" },
                highVoltageStop: { type: "U8", direction: "MEMORY" },
                highVoltageResume: { type: "U8", direction: "MEMORY" },
              },
            },
            WatchdogResetCounter: { parameters: { watchdogResetCounter: { type: "U8", direction: "MEMORY" } } },
            WiDiAccess: { parameters: { mode: { type: "U8", direction: "INPUT" } } },
            WriteBmwPartNumber: { parameters: { partNumber: { type: "U8[7]", direction: "INPUT" } } },
            WriteById: {
              parameters: { cmd: { type: "U8[]", direction: "INPUT" }, resp: { type: "U8[]", direction: "OUTPUT" } },
            },
            WriteChannelDataDynamic: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                offset: { type: "U8", direction: "INPUT" },
                data: { type: "U8[]", direction: "INPUT" },
              },
            },
            WriteChannelDataStatic: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                offset: { type: "U8", direction: "INPUT" },
                data: { type: "U8[]", direction: "INPUT" },
              },
            },
            WriteChannelWarrantyData: {
              parameters: {
                channel: { type: "U8", direction: "INPUT" },
                transmitCount: { type: "U16", direction: "INPUT" },
                trainStartCount: { type: "U8", direction: "INPUT" },
                trainSuccessCount: { type: "U8", direction: "INPUT" },
                trainTimeoutCount: { type: "U8", direction: "INPUT" },
                stuckButtonCount: { type: "U8", direction: "INPUT" },
              },
            },
            WriteI2c: {
              parameters: {
                slaveAddr: { type: "U8", direction: "INPUT" },
                regAddr: { type: "U8[]", direction: "INPUT" },
                data: { type: "U8[]", direction: "INPUT" },
              },
            },
            WritePowerTargetNa: {
              parameters: {
                dutyCycleIndex: { type: "U8", direction: "INPUT" },
                powerRegion0: { type: "S8", direction: "INPUT" },
                powerRegion1: { type: "S8", direction: "INPUT" },
                powerRegion2: { type: "S8", direction: "INPUT" },
                powerRegion3: { type: "S8", direction: "INPUT" },
                powerRegion4: { type: "S8", direction: "INPUT" },
                powerRegion5: { type: "S8", direction: "INPUT" },
                powerRegionFhss: { type: "S8", direction: "INPUT" },
              },
            },
            WriteProtoSerialNumber: { parameters: {} },
          },
        });
      },
    })
  );
});
