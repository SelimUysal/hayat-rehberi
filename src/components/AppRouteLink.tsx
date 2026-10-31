import React from 'react';

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  navigate?: () => void;
};

/** Native link semantics: middle/Ctrl/Meta/Shift click and context menu stay browser-owned. */
export const AppRouteLink = React.forwardRef<HTMLAnchorElement, Props>(function AppRouteLink(
  { href, navigate, onClick, children, ...rest }, ref
) {
  return <a {...rest} ref={ref} href={href} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
        event.shiftKey || event.altKey || rest.target === '_blank' || rest.download !== undefined) return;
    if (!navigate) return;
    event.preventDefault();
    navigate();
  }}>{children}</a>;
});
