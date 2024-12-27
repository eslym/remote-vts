import { goto } from '$app/navigation';

export function canGoBack(ev: MouseEvent & { currentTarget: HTMLAnchorElement }) {
    if (ev.defaultPrevented) return;
    if (ev.button !== 0) return;
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
    ev.preventDefault();
    goto(ev.currentTarget.href, { state: { canGoBack: true } });
}
