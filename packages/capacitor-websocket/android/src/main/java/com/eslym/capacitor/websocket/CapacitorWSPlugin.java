package com.eslym.capacitor.websocket;

import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.net.URISyntaxException;

@CapacitorPlugin(name = "CapacitorWS")
public class CapacitorWSPlugin extends Plugin {

    private final Map<String, WebSocket> connections = new ConcurrentHashMap<>();

    @PluginMethod
    public void connect(PluginCall call) {
        String url = call.getString("url");
        String id = UUID.randomUUID().toString();
        try {
            URI uri = new URI(url);
            WebSocket ws = new WebSocket(uri, id);
            connections.put(id, ws);
            JSObject ret = new JSObject();
            ret.put("id", id);
            call.resolve(ret);
            ws.connect();
        } catch (URISyntaxException e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void send(PluginCall call) {
        String id = call.getString("id");
        String data = call.getString("data");
        WebSocket ws = connections.get(id);
        if (ws != null) {
            ws.send(data);
            call.resolve();
        } else {
            call.reject("Connection not found");
        }
    }

    @PluginMethod
    public void close(PluginCall call) {
        String id = call.getString("id");
        WebSocket ws = connections.get(id);
        if (ws != null) {
            //noinspection DataFlowIssue
            ws.close(call.getInt("code", 1000), call.getString("reason", ""));
            call.resolve();
        } else {
            call.reject("Connection not found");
        }
    }

    private class WebSocket extends WebSocketClient {
        private final String id;

        public WebSocket(URI url, String id) {
            super(url);
            this.id = id;
        }

        @Override
        public void onOpen(ServerHandshake handshakedata) {
            JSObject ret = new JSObject();
            ret.put("id", id);
            notifyListeners("open", ret);
        }

        @Override
        public void onMessage(String message) {
            JSObject ret = new JSObject();
            ret.put("id", id);
            ret.put("data", message);
            notifyListeners("message", ret);
        }

        @Override
        public void onClose(int code, String reason, boolean remote) {
            JSObject ret = new JSObject();
            ret.put("id", id);
            ret.put("code", code);
            ret.put("reason", reason);
            notifyListeners("close", ret);
        }

        @Override
        public void onError(Exception ex) {
            JSObject ret = new JSObject();
            ret.put("id", id);
            ret.put("error", ex.getMessage());
            notifyListeners("error", ret);
        }
    }
}
