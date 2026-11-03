import * as React from "react";
import { Dialog, DialogTitle, DialogContent, styled, Skeleton, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReactMarkdown from "react-markdown";
import { Selectors } from "modules/client/redux/selectors";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "modules/client/redux/actions";
import changelog from "modules/../CHANGELOG.md?raw";

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: "24px",
  fontWeight: "bold",
  borderBottom: "2px solid rgba(0, 0, 0, 0.1)",
  backgroundColor: theme.vars?.palette.primary.main,
  padding: "12px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "8px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    backgroundColor: theme.vars.palette.background.paper,
  },
  margin: "auto",
  maxWidth: "40%",
  maxHeight: "75%",
}));

const ReleaseBlock = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "rgb(255, 255, 255)" : "rgba(255, 253, 253, 0.11)",
  borderRadius: theme.shape.borderRadius,
  padding: "0px 20px",
  marginTop: "20px",
  marginBottom: "20px",
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
}));

const parseReleases = (content: string): string[] => {
  const releases: string[] = [];
  const lines = content.split("\n");
  let currentRelease: string[] = [];

  for (const line of lines) {
    if (/^# \d+\.\d+\.\d+/.test(line)) {
      if (currentRelease.length > 0) {
        releases.push(currentRelease.join("\n").trim());
      }
      currentRelease = [line];
    } else {
      currentRelease.push(line);
    }
  }

  if (currentRelease.length > 0) {
    releases.push(currentRelease.join("\n").trim());
  }

  return releases;
};

export const ChangeLogDialog: React.FC<{}> = ({}) => {
  const dispatch = useDispatch();
  const changelogDialogOpen = useSelector(Selectors.NavigationDrawer.changelogDialogOpen);

  const [changelogContent, setChangelogContent] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [currentVersion, setCurrentVersion] = React.useState<string>("");

  React.useEffect(() => {
    if (changelogDialogOpen) {
      setLoading(true);
      try {
        // Find the first release header and start from there
        const firstReleaseMatch = changelog.match(/^# \d+\.\d+\.\d+/m);
        const content = firstReleaseMatch ? changelog.slice(changelog.indexOf(firstReleaseMatch[0])) : changelog;
        setChangelogContent(content);
        const versionMatch = changelog.match(/# (\d+\.\d+\.\d+)/);
        if (versionMatch && versionMatch[1]) {
          setCurrentVersion(versionMatch[1]);
        } else {
          console.warn("Could not find version in changelog.");
          setCurrentVersion("Unknown");
        }
      } catch {
        setChangelogContent("Failed to load changelog.");
      }
      setLoading(false);
    }
  }, [changelogDialogOpen]);

  const handleClose = () => {
    dispatch(Actions.NavigationDrawerActions.setChangelogDialogOpen(false));
  };

  return (
    <StyledDialog open={changelogDialogOpen} onClose={handleClose} maxWidth="md" fullWidth={true}>
      <StyledDialogTitle>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box>Operations Manager</Box>
          <Box sx={{ fontSize: "16px", fontWeight: "normal", marginTop: "-4px" }}>
            {loading ? "Loading version..." : `Version ${currentVersion}`}
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <DialogContent sx={{ pt: 2, pb: 2, backgroundColor: (theme) => theme.vars.palette.background.paper }}>
        {loading ? (
          <>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="50%" height={30} />
            <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="55%" height={30} />
            <Skeleton variant="rectangular" height={100} />
          </>
        ) : (
          <>
            {parseReleases(changelogContent).map((release, index) => (
              <ReleaseBlock key={index}>
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {release}
                </ReactMarkdown>
              </ReleaseBlock>
            ))}
          </>
        )}
      </DialogContent>
    </StyledDialog>
  );
};
