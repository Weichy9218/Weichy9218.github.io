const themeButton = document.querySelector(".theme-button");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let preferredTheme;
try {
  preferredTheme = localStorage.getItem("cw-theme");
} catch {
  /* Theme remains available without storage. */
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeButton) {
    const dark = theme === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute(
      "aria-label",
      dark ? "Use light theme" : "Use dark theme",
    );
  }
}
applyTheme(
  preferredTheme === "dark" || preferredTheme === "light"
    ? preferredTheme
    : systemTheme.matches
      ? "dark"
      : "light",
);
if (themeButton) {
  themeButton.hidden = false;
  themeButton.addEventListener("click", () => {
    preferredTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(preferredTheme);
    try {
      localStorage.setItem("cw-theme", preferredTheme);
    } catch {
      /* A session-only preference is sufficient. */
    }
  });
}
systemTheme.addEventListener("change", (event) => {
  if (!preferredTheme) applyTheme(event.matches ? "dark" : "light");
});
