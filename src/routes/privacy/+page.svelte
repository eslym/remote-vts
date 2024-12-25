<script lang="ts">
    import Localize from '$lib/coms/Localize.svelte';
</script>

<div class="mx-auto max-w-sm min-h-full">
    <p class="text-justify px-4">
        <Localize>
            {#snippet en()}
                <h2 class="text-lg font-semibold mb-4">Data Collection</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">This app does not collect anything from you.</li>
                </ul>
                <h2 class="text-lg font-semibold mt-8 mb-4">Data Usage</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">This app does not use any data from you.</li>
                </ul>
                <h2 class="text-lg font-semibold mt-8 mb-4">Data Sharing</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">This app does not share any data with anyone.</li>
                </ul>
            {/snippet}
            {#snippet zh_CN()}
                <h2 class="text-lg font-semibold mb-4">数据收集</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">此应用不会收集您的任何信息。</li>
                </ul>
                <h2 class="text-lg font-semibold mt-8 mb-4">数据使用</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">此应用不会使用您的任何信息。</li>
                </ul>
                <h2 class="text-lg font-semibold mt-8 mb-4">数据分享</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">此应用不会与任何人分享您的任何信息。</li>
                </ul>
            {/snippet}
            {#snippet zh_TW()}
                <h2 class="text-lg font-semibold mb-4">數據收集</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">此應用程式不會從您收集任何信息。</li>
                </ul>
                <h2 class="text-lg font-semibold mt-8 mb-4">數據使用</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">此應用程式不會使用您的任何信息。</li>
                </ul>
                <h2 class="text-lg font-semibold mt-8 mb-4">數據分享</h2>
                <ul class="list-disc list-outside ml-8">
                    <li class="list-item">此應用程式不會與任何人分享您的任何信息。</li>
                </ul>
            {/snippet}
        </Localize>
    </p>
</div>
