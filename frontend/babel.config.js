module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Buraya ekliyoruz, EN SONDA olmalı
      "react-native-reanimated/plugin",
    ],
  };
};