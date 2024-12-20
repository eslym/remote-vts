<script lang="ts" generics="T">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet<[T]>;
        arg: T;
    }

    let { children, arg }: Props = $props();
</script>

{@render children(arg)}
