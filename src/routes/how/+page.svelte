<script lang="ts">
    import Localize from '$lib/coms/Localize.svelte';
    import { t } from '$lib/lang';

    // TODO: complete this page
</script>

<div class="accordion-group">
    <button class="accordion outline-none text-justify" tabindex="0">
        <h2 class="accordion-title">{$t.how.connect}</h2>
        <div class="accordion-content">
            <div class="min-h-0">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla necessitatibus iusto
                laborum autem placeat aspernatur inventore eius deleniti reprehenderit? Numquam
                commodi totam mollitia quod
            </div>
        </div>
    </button>
    <button class="accordion outline-none text-justify" tabindex="0">
        <h2 class="accordion-title">{$t.how.customize}</h2>
        <div class="accordion-content">
            <div class="min-h-0">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla necessitatibus iusto
                laborum autem placeat aspernatur inventore eius deleniti reprehenderit? Numquam
                commodi totam mollitia quod
            </div>
        </div>
    </button>
</div>
