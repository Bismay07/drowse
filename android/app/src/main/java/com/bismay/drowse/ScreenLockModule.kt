package com.bismay.drowse

import android.app.admin.DevicePolicyManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.ComponentName
import android.content.Context
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import java.io.ByteArrayOutputStream
import java.util.*
import android.util.Log
import android.util.Base64
import com.facebook.react.modules.core.DeviceEventManagerModule


class ScreenLockModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName():String{
        return  "ScreenLock"
    }
    init {
        Log.d("ScreenLock Module", "ScreenLockModule instantiated")
    }

    @ReactMethod
    fun lockScreen() {
        try {
            val devicePolicyManager = reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            val adminComponent = ComponentName(reactApplicationContext, DeviceAdminReceiver::class.java)

            if (devicePolicyManager.isAdminActive(adminComponent)) {
                devicePolicyManager.lockNow()
            } else {
                // Log or handle case where device admin is not enabled
                println("Device admin not enabled")
            }
        }catch (e: Exception) {
            println("Error locking screen: ${e.message}")
        }
    }

    @ReactMethod
    fun isAdminActive(): Boolean{
            val devicePolicyManager = reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            val adminComponent = ComponentName(reactApplicationContext, DeviceAdminReceiver::class.java)

            if (devicePolicyManager.isAdminActive(adminComponent)){
                return true
            }
            return false
    }

    @ReactMethod
    fun getAppUsageStats(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val calendar = Calendar.getInstance()
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
            val result: WritableArray = Arguments.createArray()

            stats?.forEach { usageStat ->
                val map: WritableMap = Arguments.createMap()
                map.putString("packageName", usageStat.packageName)
                map.putDouble("totalTimeInForeground", usageStat.totalTimeInForeground / 1000.0)
                map.putString("appName", getAppName(usageStat.packageName))
                map.putString("appIcon", getAppIconBase64(usageStat.packageName))
                result.pushMap(map)
            }

            Log.d("AppUsageModule", "Returning ${result.toArrayList().size} apps with usage data")
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e("AppUsageModule", "Error fetching usage stats", e)
            promise.reject("USAGE_STATS_ERROR", e.message)
        }
    }

    private fun getAppName(packageName: String): String {
        return try {
            val packageManager = reactApplicationContext.packageManager
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }
    }

    private fun getAppIconBase64(packageName: String): String? {
        return try {
            val packageManager = reactApplicationContext.packageManager
            val drawable = packageManager.getApplicationIcon(packageName)
            val bitmap = (drawable as? BitmapDrawable)?.bitmap ?: return null
            val stream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
            val byteArray = stream.toByteArray()
            Base64.encodeToString(byteArray, Base64.DEFAULT)
        } catch (e: Exception) {
            null
        }
    }

    @ReactMethod
    fun checkUsagePermission(promise: Promise) {
        val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
        promise.resolve(stats != null && stats.isNotEmpty())
    }
}