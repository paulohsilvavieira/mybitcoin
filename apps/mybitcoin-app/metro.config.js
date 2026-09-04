const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// @hookform/resolvers/zod (e possivelmente outros pacotes) não declaram uma
// condição "react-native" no seu package.json:exports, então o Metro falha
// ao resolver o subpath em builds nativas (Android/iOS) mesmo funcionando na
// web. Mitigação oficial do Expo para pacotes "unprepared for package.json
// exports": https://docs.expo.dev/versions/v57.0.0/config/metro/#package-exports
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });
