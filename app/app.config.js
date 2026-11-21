const { permission: faceIDPermission } = require('./src/i18n/locales/en/unlock.json');

module.exports = ({ config }) => {
  const plugins = [...config.plugins, ['expo-local-authentication', { faceIDPermission }]];

  // Apple Personal Teams cannot provision apps with the APNs entitlement.
  if (process.env.NAPPA_PERSONAL_IOS_BUILD === '1') {
    plugins.push(['expo-notifications', { enableRemoteNotifications: false }]);
  }

  return {
    ...config,
    plugins,
    locales: {
      ...config.locales,
      en: { ios: { NSFaceIDUsageDescription: faceIDPermission } },
    },
  };
};
