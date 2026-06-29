package com.sos.responder;

import android.Manifest;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraManager;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.PermissionState;

@CapacitorPlugin(
    name = "EmergencyAlarm",
    permissions = {
        @Permission(
            alias = "camera",
            strings = { Manifest.permission.CAMERA }
        )
    }
)
public class EmergencyAlarmPlugin extends Plugin {
    private static final String TAG = "EmergencyAlarmPlugin";
    private CameraManager cameraManager;
    private String cameraId;
    private boolean isAlarmActive = false;
    private Handler handler = new Handler(Looper.getMainLooper());
    private boolean flashState = false;
    private Vibrator vibrator;
    private Ringtone ringtone;

    private Runnable flashRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isAlarmActive) return;
            try {
                if (cameraManager != null && cameraId != null && getPermissionState("camera") == PermissionState.GRANTED) {
                    flashState = !flashState;
                    cameraManager.setTorchMode(cameraId, flashState);
                }
            } catch (CameraAccessException e) {
                Log.e(TAG, "Error accessing camera flash", e);
            }
            handler.postDelayed(this, 500); // Toggle every 500ms
        }
    };

    @Override
    public void load() {
        super.load();
        try {
            cameraManager = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
            if (cameraManager != null) {
                String[] cameras = cameraManager.getCameraIdList();
                for (String id : cameras) {
                    if (cameraManager.getCameraCharacteristics(id).get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE)) {
                        cameraId = id;
                        break;
                    }
                }
            }
            vibrator = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
        } catch (Exception e) {
            Log.e(TAG, "Error initializing camera manager", e);
        }
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestPermissionForAlias("camera", call, "permissionsCallback");
        } else {
            checkDNDAndResolve(call);
        }
    }

    @PluginMethod
    public void permissionsCallback(PluginCall call) {
        checkDNDAndResolve(call);
    }

    private void checkDNDAndResolve(PluginCall call) {
        Context context = getContext();
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!notificationManager.isNotificationPolicyAccessGranted()) {
                Intent intent = new Intent(android.provider.Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void startAlarm(PluginCall call) {
        if (isAlarmActive) {
            call.resolve();
            return;
        }
        isAlarmActive = true;

        Context context = getContext();
        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        // Try to bypass DND
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (notificationManager.isNotificationPolicyAccessGranted()) {
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
                audioManager.setStreamVolume(AudioManager.STREAM_RING, audioManager.getStreamMaxVolume(AudioManager.STREAM_RING), 0);
            } else {
                Log.w(TAG, "Notification policy access not granted. Cannot bypass DND.");
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
            }
        } else {
             audioManager.setStreamVolume(AudioManager.STREAM_ALARM, audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
        }

        // Play alarm sound
        Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        if (alarmUri == null) {
            alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        }
        ringtone = RingtoneManager.getRingtone(getContext(), alarmUri);
        if (ringtone != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                ringtone.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build());
            }
            ringtone.play();
        }

        // Start vibrating
        if (vibrator != null) {
            long[] pattern = {0, 1000, 1000};
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
            } else {
                vibrator.vibrate(pattern, 0);
            }
        }

        // Start flashing
        handler.post(flashRunnable);

        call.resolve();
    }

    @PluginMethod
    public void stopAlarm(PluginCall call) {
        isAlarmActive = false;
        handler.removeCallbacks(flashRunnable);
        
        if (ringtone != null && ringtone.isPlaying()) {
            ringtone.stop();
        }

        try {
            if (cameraManager != null && cameraId != null) {
                cameraManager.setTorchMode(cameraId, false);
            }
        } catch (CameraAccessException e) {
            Log.e(TAG, "Error stopping flash", e);
        }
        
        if (vibrator != null) {
            vibrator.cancel();
        }

        call.resolve();
    }
}
