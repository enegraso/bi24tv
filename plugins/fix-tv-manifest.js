const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function fixTvManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Ensure certain features are not required so TVs are not excluded
    let features = manifest["uses-feature"] || [];
    const ensureNotRequired = [
      'android.hardware.touchscreen',
      'android.hardware.screen.portrait',
      'android.hardware.telephony',
      'android.hardware.camera',
      'android.hardware.location.gps'
    ];

    for (const fname of ensureNotRequired) {
      const found = features.find(f => f.$ && f.$['android:name'] === fname);
      if (found) {
        found.$['android:required'] = 'false';
      } else {
        features.push({ $: { 'android:name': fname, 'android:required': 'false' } });
      }
    }
    manifest['uses-feature'] = features;

    // Add LEANBACK_LAUNCHER intent so the app is available on Android TV/Google TV
    const app = manifest.application && manifest.application[0];
    if (app && app.activity) {
      const activities = app.activity;
      // Find main launcher activity (has intent-filter with MAIN and LAUNCHER)
      let mainActivity = null;
      for (const act of activities) {
        const intents = act['intent-filter'] || [];
        for (const intent of Array.isArray(intents) ? intents : [intents]) {
          const actions = intent.action || [];
          const categories = intent.category || [];
          const hasMain = actions.some(a => a.$ && a.$['android:name'] === 'android.intent.action.MAIN');
          const hasLauncher = categories.some(c => c.$ && c.$['android:name'] === 'android.intent.category.LAUNCHER');
          if (hasMain && hasLauncher) {
            mainActivity = act;
            break;
          }
        }
        if (mainActivity) break;
      }

      if (mainActivity) {
        // Ensure there's an intent-filter with LEANBACK_LAUNCHER
        let found = false;
        const intents = mainActivity['intent-filter'] || [];
        for (const intent of Array.isArray(intents) ? intents : [intents]) {
          const categories = intent.category || [];
          if (categories.some(c => c.$ && c.$['android:name'] === 'android.intent.category.LEANBACK_LAUNCHER')) {
            found = true; break;
          }
        }
        if (!found) {
          // push a new intent-filter for leanback
          const newIntent = {
            'action': [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            'category': [{ $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } }]
          };
          if (!mainActivity['intent-filter']) mainActivity['intent-filter'] = [];
          mainActivity['intent-filter'].push(newIntent);
        }
      }
      // Remove any fixed screenOrientation on activities (e.g. portrait) that
      // can cause Play Console to mark the app as not compatible with large
      // screens / TV devices. Some libraries (ML Kit barcode scanner) add an
      // activity locked to portrait; remove that attribute so the app is
      // considered flexible for TV/large screens.
      for (const act of activities) {
        try {
          if (act.$ && act.$['android:screenOrientation']) {
            const val = String(act.$['android:screenOrientation']).toLowerCase();
            if (val.includes('portrait') || val.includes('locked') || val === 'nosensor') {
              delete act.$['android:screenOrientation'];
            }
          }
        } catch (e) {
          // keep plugin robust; if something unexpected occurs, don't fail the
          // manifest modification.
        }
      }
    }

    return config;
  });
};
