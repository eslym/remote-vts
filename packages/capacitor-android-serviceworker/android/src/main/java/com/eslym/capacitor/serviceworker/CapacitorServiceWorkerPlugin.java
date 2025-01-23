package com.eslym.capacitor.serviceworker;

import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import androidx.annotation.Nullable;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CapacitorServiceWorker")
public class CapacitorServiceWorkerPlugin extends Plugin {
    @Override
    public void load() {
        super.load();
        ServiceWorkerController controller = ServiceWorkerController.getInstance();
        controller.setServiceWorkerClient(new SWClient());
    }

    private class SWClient extends ServiceWorkerClient {
        @Nullable
        @Override
        public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {

            return bridge.getLocalServer().shouldInterceptRequest(request);
        }
    }
}
