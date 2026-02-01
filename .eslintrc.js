module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
  ],
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript for prop validation
    
    // Disable unused vars warnings since Prettier with organize-imports handles this
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};