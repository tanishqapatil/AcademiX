module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      ['module-resolver', { alias: { '@': './' } }],
      // If you use css-interop (Tailwind v3), keep it here:
      // ['react-native-css-interop/babel', { className: true, unstable_transformCss: 'css' }],
      'react-native-reanimated/plugin',
    ],
  };
};
