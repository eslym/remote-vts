<script lang="ts">
    import { t } from '$lib/lang';
</script>

<div class="mx-auto max-w-sm min-h-full px-4 text-justify">
    <h2 class="text-lg font-semibold mb-4">
        {t.privacy.data_collection.title}
    </h2>
    <ul class="list-disc list-outside ml-8">
        <li class="list-item">
            {t.privacy.data_collection.description}
        </li>
    </ul>
    <h2 class="text-lg font-semibold mt-8 mb-4">
        {t.privacy.data_usage.title}
    </h2>
    <ul class="list-disc list-outside ml-8">
        <li class="list-item">
            {t.privacy.data_usage.description}
        </li>
    </ul>
    <h2 class="text-lg font-semibold mt-8 mb-4">
        {t.privacy.data_sharing.title}
    </h2>
    <ul class="list-disc list-outside ml-8">
        <li class="list-item">
            {t.privacy.data_sharing.description}
        </li>
    </ul>
</div>
