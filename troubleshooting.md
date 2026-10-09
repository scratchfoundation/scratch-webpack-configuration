# Troubleshooting Guide: Scratch Webpack Configuration

Setting up Webpack from scratch gives you immense control, but it also means you are responsible for wire-framing how every file type, asset, and module interacts. When things break, it is usually a mismatch between a loader, a plugin, or a path resolution.

Use this guide to diagnose and fix the most common errors encountered in this custom configuration.

---

## 🛡️ Quick Diagnostics Checklist

Before diving into specific errors, run through these quick checks:
1. **Node.js Version:** Ensure your Node version matches the project requirements (check via `node -v`).
2. **Clean Builds:** Delete the output directory (e.g., `dist/`) and retry.
3. **Dependency Harmony:** Ensure loaders match your major Webpack version (Webpack 5 requires modern loader versions).

---

## 🔍 Common Errors & Solutions

### 1. `ValidationError: Invalid configuration object`
* **The Symptom:** Webpack refuses to run and throws a massive schema validation error in the terminal.
* **The Cause:** A typo in a configuration key, an incorrectly structured object, or passing a plugin incorrectly.
* **The Fix:**
    * Double-check your export syntax. If using an env function, ensure it returns the object: `module.exports = (env) => { return { ... } }`.
    * Verify that plugins are instantiated with `new`:
        ```javascript
        // ❌ Incorrect
        plugins: [HtmlWebpackPlugin]
        
        //  Correct
        plugins: [new HtmlWebpackPlugin()]
        ```

### 2. `Module parse failed: Unexpected token`
* **The Symptom:** Webpack stops when encountering a specific file extension (e.g., `.jsx`, `.css`, `.scss`, `.png`).
* **The Cause:** Webpack only understands JavaScript and JSON natively. You haven't configured a loader for this file type, or the regex in your `module.rules` is failing to catch it.
* **The Fix:** * Check your `test` regex in `webpack.config.js`. For example, to support both JS and JSX, ensure the regex accounts for the optional 'x':
        ```javascript
        test: /\.(js|jsx)$/,
        ```
    * Ensure the corresponding loader (like `babel-loader` or `style-loader`) is actually installed in `package.json`.

### 3. CSS Styles Aren't Applying (or Throwing Errors)
* **The Symptom:** The build succeeds, but your app has no styles, or Webpack crashes during the style compilation phase.
* **The Cause:** Loader ordering issues. Webpack evaluates loaders from **right to left** (or bottom to top).
* **The Fix:** Rearrange your array so that compilers run first and injectors run last.
    ```javascript
    // ❌ Incorrect: style-loader runs before sass-loader compiles it
    use:
