<script lang="ts" module>
    interface ViewProps {
        readonly dimensions: DOMRect;
        readonly offset: { readonly x: number; readonly y: number };
        readonly cursor: { readonly x: number; readonly y: number };
    }

    let dragTarget: string | undefined = $state(undefined);
    let dragValue: unknown = $state(undefined);

    let domDragState:
        | {
              container: HTMLDivElement;
              component: {};
              cleanup?: () => void;
          }
        | undefined = undefined;

    let cursorX = $state(0);
    let cursorY = $state(0);

    const cursorPos = {
        get x() {
            return cursorX;
        },
        get y() {
            return cursorY;
        }
    };

    function dragfinished() {
        if (dragTarget === undefined) return;
        unmount(domDragState!.component);
        domDragState!.container.remove();
        domDragState!.cleanup?.();
        domDragState = undefined;
        dragTarget = undefined;
        dragValue = undefined;
    }

    on(
        window,
        'mousedown',
        (ev) => {
            cursorX = ev.clientX;
            cursorY = ev.clientY;
        },
        { capture: true, passive: false }
    );

    on(
        window,
        'touchstart',
        (ev) => {
            const touch = ev.touches[0];
            if (touch) {
                cursorX = touch.clientX;
                cursorY = touch.clientY;
            }
        },
        { capture: true, passive: false }
    );

    on(
        window,
        'touchmove',
        (ev) => {
            const touch = ev.touches[0];
            if (touch) {
                cursorX = touch.clientX;
                cursorY = touch.clientY;
            }
        },
        { capture: true, passive: false }
    );

    on(
        window,
        'mousemove',
        (ev) => {
            cursorX = ev.clientX;
            cursorY = ev.clientY;
        },
        { capture: true, passive: false }
    );

    on(window, 'mouseup', dragfinished);
    on(window, 'touchend', dragfinished);

    function createDragView(snippet: Snippet<[ViewProps]>, props: ViewProps) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.zIndex = '9999999';
        container.style.inset = '0';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
        const component = mount<{ children: Snippet<[ViewProps]>; arg: ViewProps }, {}>(
            SnippetRenderer,
            {
                target: container,
                props: {
                    children: snippet,
                    arg: props
                }
            }
        );
        return { container, component };
    }

    function overlaped(node: HTMLElement, event: { clientX: number; clientY: number }) {
        const rect = node.getBoundingClientRect();
        return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        );
    }

    export const dragState = {
        get dragging() {
            return Boolean(dragTarget);
        },
        get dragValue() {
            return dragValue;
        }
    } as
        | { readonly dragging: false; readonly dragValue: undefined }
        | { readonly dragging: true; readonly dragValue: unknown };

    export const dragEffects: Action<
        HTMLElement,
        undefined,
        {
            ondraggingover: (event: CustomEvent<undefined>) => void;
            ondraggingout: (event: CustomEvent<undefined>) => void;
            ondraggingdrop: (event: CustomEvent<undefined>) => void;
        }
    > = (node) => {
        let dragOver = false;
        let touchOver = false;
        function mouseOver() {
            if (dragTarget === undefined) return;
            dragOver = true;
            node.dispatchEvent(
                new CustomEvent('draggingover', {
                    detail: dragValue
                })
            );
        }
        function mouseOut() {
            if (dragTarget === undefined) return;
            dragOver = false;
            node.dispatchEvent(
                new CustomEvent('draggingout', {
                    detail: dragValue
                })
            );
        }
        function mouseDrop() {
            if (dragTarget === undefined) return;
            if (dragOver) {
                node.dispatchEvent(
                    new CustomEvent('draggingdrop', {
                        detail: dragValue
                    })
                );
            }
        }
        function windowTouchMove(ev: TouchEvent) {
            if (dragTarget === undefined) return;
            const touch = ev.touches[0];
            if (touch) {
                cursorX = touch.clientX;
                cursorY = touch.clientY;
                const overlap = overlaped(node, touch);
                if (overlap !== touchOver) {
                    touchOver = overlap;
                    if (overlap) {
                        mouseOver();
                    } else {
                        mouseOut();
                    }
                }
            }
        }

        function reset() {
            dragOver = false;
            touchOver = false;
            mouseOut();
        }

        function documentTouchEnd(ev: TouchEvent) {
            if (dragTarget !== undefined && touchOver) {
                const touch = ev.touches[0];
                if (touch && overlaped(node, touch)) {
                    mouseDrop();
                }
            }
            dragOver = false;
            touchOver = false;
        }

        const cleanups = new Set<() => void>();
        cleanups.add(on(node, 'mouseover', mouseOver));
        cleanups.add(on(node, 'mouseout', mouseOut));

        cleanups.add(
            on(window, 'mouseup', () => {
                if (dragTarget !== undefined && dragOver) {
                    mouseDrop();
                }
                dragOver = false;
                touchOver = false;
            })
        );

        cleanups.add(on(document, 'touchmove', windowTouchMove));
        cleanups.add(on(document, 'touchend', documentTouchEnd));
        cleanups.add(on(document, 'touchcancel', documentTouchEnd));

        cleanups.add(on(document, 'blur', reset));
        cleanups.add(on(document, 'mouseout', reset));

        return {
            destroy() {
                for (const cleanup of cleanups) {
                    cleanup();
                }
            }
        };
    };
</script>

<script lang="ts">
    import { mount, onDestroy, unmount, type Snippet } from 'svelte';
    import type { Action } from 'svelte/action';
    import SnippetRenderer from './SnippetRenderer.svelte';
    import { on } from 'svelte/events';

    interface SlotProps {
        dragHandle: Action<HTMLElement>;
        dragTarget: Action<HTMLElement>;
        isDragging: boolean;
    }

    interface Props {
        children: Snippet<[SlotProps]>;
        draggingView: Snippet<[ViewProps]>;
        dragValue?: unknown;
        ondraggingstart?: (event: CustomEvent<undefined>) => void;
        ondraggingend?: (event: CustomEvent<undefined>) => void;
    }

    let {
        children,
        draggingView,
        dragValue: value = undefined,
        ondraggingstart,
        ondraggingend
    }: Props = $props();

    const dragId = crypto.randomUUID();

    let targetNode: HTMLElement | undefined = undefined;
    let isDragging = $derived(dragTarget === dragId);

    function dragStart(node: HTMLElement) {
        if (dragTarget !== undefined) return;
        dragTarget = dragId;
        dragValue = value;
        const rect = node.getBoundingClientRect();
        const offset = {
            x: cursorPos.x - rect.left,
            y: cursorPos.y - rect.top
        };
        const el = createDragView(draggingView, {
            dimensions: rect,
            offset,
            cursor: cursorPos
        });
        domDragState = {
            ...el,
            cleanup: () => {
                dragEnd();
            }
        };
        ondraggingstart?.(new CustomEvent('draggingstart'));
    }

    function dragEnd() {
        if (dragTarget !== dragId) return;
        dragTarget = undefined;
        dragValue = undefined;
        ondraggingend?.(new CustomEvent('draggingend'));
    }

    const dragHandleAction: Action<HTMLElement> = (node) => {
        const old = node.style.touchAction;
        node.style.touchAction = 'none';
        const offmousedown = on(node, 'mousedown', (ev: MouseEvent) => {
            if (ev.button !== 0) return;
            dragStart(targetNode ?? node);
        });
        const offtouchstart = on(node, 'touchstart', (ev: TouchEvent) => {
            dragStart(targetNode ?? node);
        });
        return {
            destroy() {
                offmousedown();
                offtouchstart();
                node.style.touchAction = old;
            }
        };
    };

    const dragTargetAction: Action<HTMLElement> = (node) => {
        targetNode = node;
        return {
            destroy() {
                targetNode = undefined;
            }
        };
    };

    onDestroy(() => {
        if (dragTarget !== dragId) return;
        dragfinished();
    });
</script>

{@render children({
    dragHandle: dragHandleAction,
    dragTarget: dragTargetAction,
    get isDragging() {
        return isDragging;
    }
})}
