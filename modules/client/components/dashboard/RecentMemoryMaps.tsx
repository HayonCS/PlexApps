import { IconButton, styled, Tooltip, Typography } from "@mui/material";
import { useGetScreenSize } from "modules/client/hooks/useGetScreenSize";
import React from "react";
import { RecentMemoryMapCard } from "./RecentMemoryMapCard";
import { useSelector } from "react-redux";
import { Selectors } from "modules/client/redux/selectors";
import { useGetRecentMemoryMaps } from "modules/client/hooks/useGetRecentMemoryMaps";
import { PlaceholderCard } from "./PlaceholderCard";
import { useClearRecentMemoryMapsMutation } from "modules/client/graphql/types.gen";
import { PiBroomFill as ClearIcon } from "react-icons/pi";

const MAX_VISIBLE_RECENT_MEMORY_MAPS = 5;

const StyledRecentMemoryMapsWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  position: "relative",
  justifyContent: "center",
  display: "flex",
  ".header": {
    position: "absolute",
    top: "-15px",
    left: "15%",
    paddingLeft: "30px",
    paddingRight: "30px",
    backgroundColor: theme.vars.palette.background.default,
    zIndex: 1,
    display: "flex",
    gap: "20px",
  },
  ".headerText": {
    fontSize: theme.typography.h2.fontSize,
  },
  ".clearButton": {
    transition: "opacity 0.2s ease",
    color: theme.palette.grey[400],
    "&:hover": {
      opacity: 1,
    },
    height: "30px",
    width: "30px",
  },
  [theme.getColorSchemeSelector("light")]: {
    ".headerText": {
      color: theme.palette.grey[400],
    },
  },
  [theme.getColorSchemeSelector("dark")]: {
    ".headerText": {
      color: theme.palette.grey[400],
    },
  },
}));

const StyledRecentMemoryMaps = styled("div")<{ hasScrollbar: boolean }>(({ theme, hasScrollbar }) => [
  {
    display: "flex",
    flexDirection: "row",
    flexShrink: 0,
    gap: "30px",
    width: "80%",
    padding: "30px",
    borderRadius: theme.vars.shape.borderRadius,
    position: "relative",
    justifyContent: hasScrollbar ? "flex-start" : "center",
    overflowX: "scroll",
    overflowY: "hidden",
    "& > *": {
      flexShrink: 0,
    },
  },
  theme.applyStyles("light", {
    border: `3px solid ${theme.palette.grey[300]}`,
  }),
  theme.applyStyles("dark", {
    border: `3px solid ${theme.vars.palette.grey[800]}`,
  }),
]);
export const RecentMemoryMaps: React.FC = () => {
  const screenSize = useGetScreenSize();
  const currentUserName = useSelector(Selectors.Authentication.currentUserName);

  const [cards, setCards] = React.useState<React.ReactElement[]>();
  const [hasRealCards, setHasRealCards] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCardCount, setVisibleCardCount] = React.useState<number>(screenSize);

  const recentMemoryMaps = useGetRecentMemoryMaps(currentUserName);
  const [clearRecentMemoryMaps] = useClearRecentMemoryMapsMutation();

  const handleClearRecentMaps = () => {
    if (currentUserName && currentUserName !== "unknown") {
      void clearRecentMemoryMaps({
        variables: { userName: currentUserName },
        refetchQueries: ["GetRecentMemoryMaps"],
      });
    }
  };

  const [hasScrollbar, setHasScrollbar] = React.useState<boolean>(false);

  React.useEffect(() => {
    const copiedRef = containerRef.current;
    if (copiedRef) {
      const onWheel = (event: any) => {
        if (copiedRef) {
          event.preventDefault();
          copiedRef.scrollTo({
            left: copiedRef.scrollLeft + event.deltaY,
            behavior: "auto",
          });
        }
      };
      containerRef.current.addEventListener("wheel", onWheel);
      return () => {
        if (copiedRef) {
          copiedRef.removeEventListener("wheel", onWheel);
        }
      };
    }
  }, []);

  React.useEffect(() => {
    const calculateVisibleCards = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const firstCard = container.querySelector("& > *:first-child") as HTMLElement;

      if (!firstCard) {
        setVisibleCardCount(screenSize);
        return;
      }

      const cardWidth = firstCard.offsetWidth;
      const gap = 30; // Gap between cards as defined in StyledRecentMemoryMaps
      const padding = 60; // Total horizontal padding (30px on each side)

      const availableWidth = containerWidth - padding;
      const cardWithGap = cardWidth + gap;
      const fitsCompletely = Math.floor((availableWidth + gap) / cardWithGap);

      setVisibleCardCount(Math.max(1, fitsCompletely));
      const hasScrollableContent = containerRef.current.scrollWidth > containerRef.current.clientWidth;

      if (hasScrollableContent) {
        setHasScrollbar(true);
      } else {
        setHasScrollbar(false);
      }
    };

    // Initial calculation
    const timer = setTimeout(calculateVisibleCards, 100);

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateVisibleCards);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [screenSize, cards]);

  React.useEffect(() => {
    let cardList: React.ReactElement[] = [];
    if (recentMemoryMaps !== "ERROR" && recentMemoryMaps !== "LOADING") {
      cardList = recentMemoryMaps
        .slice(0, MAX_VISIBLE_RECENT_MEMORY_MAPS)
        .map((recentMap, index) => (
          <RecentMemoryMapCard
            key={`${recentMap.memoryMapName}-${recentMap.bomRevision}-${recentMap.version}-${index}`}
            memoryMapName={recentMap.memoryMapName}
            bomRevision={recentMap.bomRevision}
            version={recentMap.version}
            lastAccessed={recentMap.lastAccessed}
          />
        ));
    }

    const placeholdersNeeded = Math.max(0, visibleCardCount - cardList.length);
    const placeholderCards = Array.from({ length: placeholdersNeeded }, (_, i) => (
      <PlaceholderCard key={`placeholder-${i}`} />
    ));

    setCards([...cardList, ...placeholderCards]);
    setHasRealCards(cardList.length > 0);
  }, [recentMemoryMaps, visibleCardCount]);

  return (
    <StyledRecentMemoryMapsWrapper>
      <div className={"header"}>
        <Typography className={"headerText"}>RECENT MEMORY MAPS</Typography>
        {hasRealCards && (
          <Tooltip title="Clear Recent Memory Maps">
            <IconButton
              className={"clearButton"}
              size="small"
              onClick={handleClearRecentMaps}
              data-testid={"clear-recent-maps-button"}
            >
              <ClearIcon size="25" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <StyledRecentMemoryMaps
        hasScrollbar={hasScrollbar}
        id={"recent-memory-maps"}
        ref={containerRef}
        data-testid={"recent-memory-maps"}
        sx={{ overflowX: hasRealCards ? "auto" : "hidden" }}
      >
        {cards}
      </StyledRecentMemoryMaps>
    </StyledRecentMemoryMapsWrapper>
  );
};
