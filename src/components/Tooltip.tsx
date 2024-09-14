import { cloneElement, Fragment, useState } from "react";
import {
  Placement,
  offset,
  flip,
  shift,
  autoUpdate,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useRole,
  useDismiss,
  useMergeRefs,
} from "@floating-ui/react";

interface Props {
  label: string;
  placement?: Placement;
  children: JSX.Element;
}

export function Tooltip({ children, label, placement }: Props) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context);
  const focus = useFocus(context);
  const role = useRole(context, { role: "tooltip" });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    role,
    dismiss,
  ]);

  const ref = useMergeRefs([refs.setReference, (children as any).ref]);

  return (
    <Fragment>
      {cloneElement(children, getReferenceProps({ ref, ...children.props }))}
      {open && (
        <div
          className="Tooltip z-50 bg-foreground text-muted-100 rounded-md px-2 py-1 text-xs max-w-16 text-center"
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {label}
        </div>
      )}
    </Fragment>
  );
}
