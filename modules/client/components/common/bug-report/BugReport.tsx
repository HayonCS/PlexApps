import * as React from "react";
import { Box, Button, CircularProgress, FormControl, styled, TextField, Typography } from "@mui/material";
import {
  FreshserviceCatalogOptions,
  useCreateFreshserviceServiceRequestMutation,
  useGetFreshserviceGtmCatalogIdQuery,
} from "modules/client/graphql/types.gen";
import { useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";
import { FreshserviceRequestFields } from "modules/domain-services/freshservice/freshservice";
import { GentexBlue } from "modules/client/styles/app-theme";
import freshserviceImage from "modules/client/icons/freshservice.svg";

type Status = "Loading" | "Success" | "Error";

const RootBox = styled(Box)(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.vars.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const LoadingOverlay = styled(Box)(({}) => ({
  zIndex: 1,
  width: "100%",
  height: "100%",
  position: "absolute",
}));

const LoadingSpinner = styled(CircularProgress)({
  zIndex: 2,
  color: GentexBlue,
  position: "relative",
  top: "50%",
  left: "50%",
  marginTop: "-10px",
  marginLeft: "-12px",
});

const Header = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "20px",
  padding: "8px 8px 8px 16px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
});

const HeaderTitle = styled(Typography)({
  display: "flex",
  alignItems: "center",
  fontSize: "24px",
  fontWeight: 400,
  cursor: "default",
  userSelect: "none",
});

const LogoContainer = styled(Box)({
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
});

const Body = styled(Box)({
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
  padding: "16px",
  paddingBottom: "24px",
  display: "flex",
  flexDirection: "column",
  rowGap: "16px",
});

const InputLabel = styled(Typography)({
  fontSize: "16px",
  fontWeight: 400,
  paddingLeft: "4px",
});

const Footer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "end",
  gap: "8px",
  padding: "8px 10px 8px 20px",
  borderTop: "1px solid rgba(0, 0, 0, 0.2)",
});

const ActionButton = styled(Button)({
  fontSize: 16,
  fontWeight: 400,
  textTransform: "none",
});

export const BugReport: React.FC<{
  catalog?: FreshserviceCatalogOptions;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onCancel?: () => void;
}> = (props) => {
  const detailsRef = React.useRef<HTMLTextAreaElement | null>(null);
  const currentUserName = useSelector(Selectors.Authentication.currentUserName);

  const [summaryValue, setSummaryValue] = React.useState("");

  const [detailsValue, setDetailsValue] = React.useState("");

  const [status, setStatus] = React.useState<Status>();

  const catalogOption = props.catalog ?? FreshserviceCatalogOptions.Software;
  const {
    data: catalogData,
    loading: catalogLoading,
    error: catalogError,
  } = useGetFreshserviceGtmCatalogIdQuery({
    variables: { catalog: catalogOption },
  });

  const [createServiceRequest, { loading: createRequestLoading }] = useCreateFreshserviceServiceRequestMutation();

  const catalogId = catalogData?.getFreshserviceGTMCatalogId ?? null;

  const isLoading = status === "Loading" || catalogLoading || createRequestLoading;

  const [errors, setErrors] = React.useState({
    summary: false,
    details: false,
  });

  const [focused, setFocused] = React.useState({
    summary: false,
    details: false,
  });

  const handleSubmitTicket = async () => {
    let error = false;
    if (errors.summary || summaryValue.trim().length < 1) {
      setErrors((x) => {
        return { ...x, summary: true };
      });
      error = true;
    }
    if (errors.details || detailsValue.trim().length < 1) {
      setErrors((x) => {
        return { ...x, details: true };
      });
      error = true;
    }
    if (error) {
      return;
    }
    if (!catalogId) {
      setStatus("Error");
      if (props.onError) {
        props.onError("Freshservice catalog is unavailable. Please try again later.");
      }
      return;
    }
    setStatus("Loading");

    const fields: FreshserviceRequestFields = {
      summary: summaryValue.trim(),
      details: detailsValue.trim(),
      application_software: "Ops Manager",
    };

    try {
      const shouldMockSuccess = import.meta.env.VITE_FRESHSERVICE_MOCK_SUCCESS === "true";

      let data;
      if (shouldMockSuccess) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        data = {
          createFreshserviceServiceRequest: {
            id: 999999,
            subject: summaryValue.trim(),
            description: detailsValue.trim(),
          },
        };
      } else {
        const response = await createServiceRequest({
          variables: {
            catalogId,
            where: { userId: currentUserName },
            fields,
          },
          context: {
            headers: {
              freshservice: true,
            },
          },
        });
        data = response.data;
      }

      if (!data?.createFreshserviceServiceRequest) {
        throw new Error("Freshservice did not return the created service request.");
      }

      setStatus("Success");
      setSummaryValue("");
      setDetailsValue("");
      setErrors({ summary: false, details: false });
      setFocused({ summary: false, details: false });

      if (props.onSuccess) props.onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit Freshservice request.";
      setStatus("Error");
      if (props.onError) {
        props.onError(message);
      }
    }
  };

  const handleCancelTicket = () => {
    if (props.onCancel) props.onCancel();
  };

  React.useEffect(() => {
    if (!catalogError) {
      return;
    }

    setStatus("Error");
    if (props.onError) {
      props.onError("Unable to load Freshservice catalog information.");
    }
  }, [catalogError, props]);

  React.useEffect(() => {
    if (focused.summary && summaryValue.trim().length < 1) {
      setErrors((x) => {
        return { ...x, summary: true };
      });
    } else {
      setErrors((x) => {
        return { ...x, summary: false };
      });
    }
    if (focused.details && detailsValue.trim().length < 1) {
      setErrors((x) => {
        return { ...x, details: true };
      });
    } else {
      setErrors((x) => {
        return { ...x, details: false };
      });
    }
  }, [summaryValue, detailsValue, focused]);

  return (
    <RootBox data-testid="bugReportRoot">
      {isLoading && (
        <LoadingOverlay data-testid="bugReportProgress">
          <LoadingSpinner size={24} data-testid="submitting-problem" />
        </LoadingOverlay>
      )}

      <Header data-testid="bugReportHeader">
        <LogoContainer>
          <img src={freshserviceImage} height={40} draggable={false} alt="Powered by FreshService" />
        </LogoContainer>
        <HeaderTitle>{"Report a Problem"}</HeaderTitle>
      </Header>

      <Body data-testid="bugReportBody">
        <FormControl data-testid="bugReportSummary">
          <InputLabel>{"Title"}</InputLabel>
          <TextField
            id="summary-input"
            data-testid="bugReportSummaryField"
            variant="outlined"
            error={errors.summary}
            maxRows={2}
            minRows={1}
            helperText={errors.summary ? "* Required" : undefined}
            value={summaryValue}
            placeholder="Title"
            onChange={(event) => {
              setSummaryValue(event.target.value);
            }}
            disabled={isLoading}
            slotProps={{
              htmlInput: {
                "data-testid": "bugReportSummaryInput",
              },
            }}
            onBlur={() => {
              setFocused((x) => {
                return { ...x, summary: true };
              });
            }}
          />
        </FormControl>

        <FormControl data-testid="bugReportDetails">
          <InputLabel>{"Summary"}</InputLabel>
          <TextField
            id="details-input"
            data-testid="bugReportDetailsField"
            variant="outlined"
            error={errors.details}
            helperText={errors.details ? "* Required" : undefined}
            autoFocus={true}
            multiline={true}
            minRows={5}
            maxRows={100}
            value={detailsValue}
            placeholder="Add a detailed summary of the issue."
            onChange={(event) => {
              setDetailsValue(event.target.value);
            }}
            disabled={isLoading}
            slotProps={{
              htmlInput: {
                "data-testid": "bugReportDetailsInput",
              },
              input: {
                ref: detailsRef,
                sx: {},
              } as any,
            }}
            onBlur={() => {
              setFocused((x) => {
                return { ...x, details: true };
              });
            }}
          />
        </FormControl>
      </Body>

      <Footer data-testid="bugReportFooter">
        <ActionButton
          data-testid="bugReportCancel"
          variant="contained"
          size="small"
          onClick={handleCancelTicket}
          disabled={isLoading}
        >
          {"Cancel"}
        </ActionButton>
        <ActionButton
          data-testid="bugReportSubmit"
          variant="contained"
          size="small"
          color="primary"
          onClick={() => {
            void handleSubmitTicket();
          }}
          disabled={isLoading || !catalogId}
        >
          {"Submit"}
        </ActionButton>
      </Footer>
    </RootBox>
  );
};
