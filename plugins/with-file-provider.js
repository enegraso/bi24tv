const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withFileProvider(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // Add REQUEST_INSTALL_PACKAGES permission
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }
    const hasInstallPerm = manifest['uses-permission'].some(
      (p) => p.$?.['android:name'] === 'android.permission.REQUEST_INSTALL_PACKAGES'
    );
    if (!hasInstallPerm) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.REQUEST_INSTALL_PACKAGES' },
      });
    }

    // Add FileProvider to application
    if (!manifest.application) {
      manifest.application = [{}];
    }
    const app = manifest.application[0];

    if (!app['provider']) {
      app['provider'] = [];
    }

    // Check if already exists
    const exists = app['provider'].some(
      (p) => p.$?.['android:name'] === 'androidx.core.content.FileProvider'
    );

    if (!exists) {
      app['provider'].push({
        $: {
          'android:name': 'androidx.core.content.FileProvider',
          'android:authorities': `${cfg.modResults.manifest.$?.package}.fileprovider`,
          'android:exported': 'false',
          'android:grantUriPermissions': 'true',
        },
        'meta-data': [
          {
            $: {
              'android:name': 'android.support.FILE_PROVIDER_PATHS',
              'android:resource': '@xml/file_provider_paths',
            },
          },
        ],
      });
    }

    return cfg;
  });
};
