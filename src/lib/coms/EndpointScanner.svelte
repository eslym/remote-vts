<script lang="ts" module>
    let endpoints: string[] = $state([]);
    let port = $state(8001);
</script>

<script lang="ts">
    import { cordovaHttpGet } from '$lib/cordova';
    import { t } from '$lib/lang';
    import { page } from '$app/stores';
    import { parseCidr } from 'cidr-tools';
    import { parseIp, stringifyIp } from 'ip-bigint';
    import { endpoint, history as endpointHistory } from '$lib/config';
    import { goto } from '$app/navigation';
    let ips: string[] = $state([]);
    let scanning = $state(false);
    let ipVersion: 4 | 6 = $state(4);
    let scanIndex = $state(0);
    let scanParallel = $state(10);

    function formatHost(ip: string, version: 4 | 6) {
        const hostname = version === 4 ? ip : `[${ip}]`;
        return `${hostname}:${port}`;
    }

    function startScan(ev: SubmitEvent) {
        ev.preventDefault();
        if (scanning) {
            scanning = false;
            return;
        }
        endpoints = [];
        scanning = true;
        scanIndex = 0;
        scanParallel = 10;
    }

    $effect(() => {
        if (port < 1) {
            port = 1;
        } else if (port > 65535) {
            port = 65535;
        }
    });

    $effect(() => {
        [scanning, scanIndex, scanParallel];
        if (!scanning) return;
        if (scanIndex >= ips.length) {
            if (scanParallel === 10) {
                scanning = false;
            }
            return;
        }
        if (scanParallel === 0) {
            return;
        }
        const toScan = formatHost(ips[scanIndex], ipVersion);
        scanIndex++;
        scanParallel--;
        cordovaHttpGet(`http://${toScan}`).then(
            (res) => {
                console.log(res);
                if (res.status === 400 && res.headers?.server?.startsWith('websocket-sharp/')) {
                    endpoints.push(`ws://${toScan}`);
                }
                scanParallel++;
            },
            () => {}
        );
    });

    networkinterface.getWiFiIPAddress(
        (addr) => {
            const _ips: bigint[] = [];
            const mask = parseIp(addr.subnet)
                .number.toString(2)
                .split('')
                .filter((c) => c === '1').length;
            const cidr = parseCidr(`${addr.ip}/${mask}`);
            const ip = parseIp(addr.ip);
            for (let i = cidr.start; i <= cidr.end; i++) {
                if (ip.number === i) continue;
                _ips.push(i);
            }
            ips = _ips
                .toSorted((a, b) => Number(abs(ip.number - a) - abs(ip.number - b)))
                .map((n) => stringifyIp({ number: n, version: ip.version }, { compress: true }));
        },
        () => {}
    );

    function abs(n: bigint) {
        return n < 0 ? -n : n;
    }

    $inspect(ips[scanIndex]);
</script>

<form class="form-group" onsubmit={startScan}>
    <div class="form-field">
        <label for="port" class="form-label">{$t.settings.scan.port}</label>
        <input
            id="port"
            type="number"
            class="input input-solid input-block"
            min="1"
            max="65535"
            bind:value={port}
            disabled={scanning}
        />
    </div>
    <button class="btn" class:btn-solid-primary={!scanning} class:btn-solid-error={scanning}>
        {#if scanning}
            <div class="mr-2 size-4">
                <div
                    class="rounded-full border-2 border-red-10 !border-b-transparent size-4 animate-spin"
                ></div>
            </div>
        {/if}
        {$t.settings.scan[scanning ? 'stop' : 'start']}
    </button>
</form>
<div class="form-field mt-8">
    <div class="form-label">{$t.settings.scan.endpoints}</div>
    <div class="menu-section">
        <ul class="menu-items">
            {#each endpoints as ep}
                <li class="display">
                    <button
                        class="menu-item text-lg text-center justify-center font-mono w-full"
                        onclick={() => {
                            endpoint.set(ep);
                            if (ep !== 'ws://127.0.0.1:8001' && !$endpointHistory.includes(ep)) {
                                $endpointHistory = [ep, ...$endpointHistory];
                                if ($endpointHistory.length > 20) {
                                    $endpointHistory = $endpointHistory.slice(0, 10);
                                }
                            }
                            if ($page.state.canGoBack) {
                                history.back();
                            } else {
                                goto('/settings');
                            }
                        }}
                    >
                        {ep}
                    </button>
                </li>
            {:else}
                <li class="menu-item menu-item-disabled text-lg text-center justify-center">
                    {$t.settings.scan.empty}
                </li>
            {/each}
        </ul>
    </div>
</div>
