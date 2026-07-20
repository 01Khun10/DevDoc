import * as RadixTooltip from "@radix-ui/react-tooltip";

/**
 * Reusable tooltip wrapper for icon-only buttons.
 *
 * Usage:
 *   <Tooltip content="Delete">
 *     <button>🗑</button>
 *   </Tooltip>
 */
function Tooltip({ content, children, side = "top", sideOffset = 6 }) {
  if (!content) return children;

  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={sideOffset}
          className="z-[60] rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-lg animate-in fade-in-0 zoom-in-95"
          style={{
            backgroundColor: "var(--devdoc-surface)",
            borderColor: "var(--devdoc-border)",
            color: "var(--devdoc-text)",
            boxShadow: "var(--devdoc-shadow-md)",
          }}
        >
          {content}
          <RadixTooltip.Arrow
            className="fill-[var(--devdoc-surface)]"
            width={10}
            height={5}
          />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export default Tooltip;
