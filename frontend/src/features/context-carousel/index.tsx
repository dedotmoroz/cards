import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { CardContext } from '@/shared/types/cards';

type ContextCarouselProps = {
  contexts: CardContext[];
  activeContextId?: string | null;
  /** Which side text to show */
  side: 'text' | 'translation';
  onSelect: (contextId: string) => void;
  /** Optional: tap cycles to next when clicking the text zone */
  enableTapCycle?: boolean;
  textVariant?: 'body2' | 'body1';
  textColor?: string;
};

function resolveIndex(contexts: CardContext[], activeContextId?: string | null): number {
  if (contexts.length === 0) return 0;
  if (activeContextId) {
    const idx = contexts.findIndex((c) => c.id === activeContextId);
    if (idx >= 0) return idx;
  }
  return contexts.length - 1;
}

export function ContextCarousel({
  contexts,
  activeContextId,
  side,
  onSelect,
  enableTapCycle = true,
  textVariant = 'body2',
  textColor = 'text.secondary',
}: ContextCarouselProps) {
  if (contexts.length === 0) return null;

  const index = resolveIndex(contexts, activeContextId);
  const current = contexts[index];
  const display = side === 'text' ? current.text : current.translation;
  const showNav = contexts.length > 1;

  const go = (delta: number) => {
    const next = (index + delta + contexts.length) % contexts.length;
    onSelect(contexts[next].id);
  };

  return (
    <Box
      sx={{ width: '100%' }}
      onClick={(e) => e.stopPropagation()}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.5,
        }}
      >
        {showNav && (
          <IconButton
            size="small"
            aria-label="Previous context"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            sx={{ mt: -0.5 }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
        <Box
          component="p"
          onClick={
            enableTapCycle && showNav
              ? (e) => {
                  e.stopPropagation();
                  go(1);
                }
              : undefined
          }
          sx={{
            flex: 1,
            m: 0,
            cursor: enableTapCycle && showNav ? 'pointer' : 'default',
            color: textColor,
            fontSize: textVariant === 'body1' ? '1rem' : '0.875rem',
            lineHeight: 1.43,
            whiteSpace: 'pre-wrap',
          }}
        >
          {display}
        </Box>
        {showNav && (
          <IconButton
            size="small"
            aria-label="Next context"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            sx={{ mt: -0.5 }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {showNav && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 0.75,
            mt: 0.75,
          }}
        >
          {contexts.map((ctx, i) => (
            <Box
              key={ctx.id}
              component="button"
              type="button"
              aria-label={`Context ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(ctx.id);
              }}
              sx={{
                width: 7,
                height: 7,
                p: 0,
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                bgcolor: i === index ? '#747275' : 'action.disabled',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
