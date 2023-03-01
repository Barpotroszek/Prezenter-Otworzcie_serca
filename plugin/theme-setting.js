chrome.storage.local.onChanged.addListener(({ theme }) => {
  if(theme == undefined) return;
  document.documentElement.setAttribute("data-theme", theme.newValue);
  try {
    document.getElementById("dark-mode").checked = theme.newValue == "dark";
  } catch (error) {}
});

chrome.storage.local.get(["theme"]).then(({ theme }) => {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    document.getElementById("dark-mode").checked = theme == "dark";
  } catch (e) {}
});
