package com.eslym.capacitor.networkinterface;

import android.annotation.SuppressLint;
import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.List;

@CapacitorPlugin(name = "NetworkInterface")
public class NetworkInterfacePlugin extends Plugin {
    @PluginMethod
    public void getWiFiIPAddress(PluginCall call) {
        WifiManager wifiManager = (WifiManager) this.getActivity().getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        WifiInfo wifiInfo = wifiManager.getConnectionInfo();
        int ip = wifiInfo.getIpAddress();

        @SuppressLint("DefaultLocale")
        String ipString = String.format(
                "%d.%d.%d.%d",
                (ip & 0xff),
                (ip >> 8 & 0xff),
                (ip >> 16 & 0xff),
                (ip >> 24 & 0xff)
        );

        try {
            InetAddress inetAddress = InetAddress.getByName(ipString);
            short mask = getIPv4MaskBits(inetAddress);
            JSObject ret = new JSObject();
            ret.put("ip", ipString);
            ret.put("mask", mask);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    public static short getIPv4MaskBits(InetAddress inetAddress) throws SocketException {
        NetworkInterface ni = NetworkInterface.getByInetAddress(inetAddress);
        List<InterfaceAddress> intAddrs = ni.getInterfaceAddresses();
        for (InterfaceAddress ia : intAddrs) {
            if (!ia.getAddress().isLoopbackAddress() && ia.getAddress() instanceof Inet4Address) {
                return ia.getNetworkPrefixLength();
            }
        }
        throw new SocketException("No IPv4 address found");
    }
}
