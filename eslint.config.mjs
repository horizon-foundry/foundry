// eslint-config-next 16 ships a native flat-config array at its main export.
// Consume it directly; FlatCompat's schema validation trips a circular-ref bug
// on the plugin objects, so avoid it.
import next from "eslint-config-next";

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "tmp/**"] },
  ...next,
];

export default eslintConfig;
