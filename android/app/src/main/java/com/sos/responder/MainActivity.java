package com.sos.responder;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EmergencyAlarmPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
