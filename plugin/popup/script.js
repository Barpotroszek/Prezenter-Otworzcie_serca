// creating listener for uploading data request
let song_info;
const main_tools = {
  search_song: document.getElementById("search-song"),
  stop_presentation: document.getElementById("stop-presentation"),
  external_tab: document.getElementById("external-tab"),
  dark_mode: document.getElementById("dark-mode"),
};

const controls = {
  title: document.getElementById("title"),
  left_btn: document.getElementById("left"),
  right_btn: document.getElementById("right"),
  chorus_btn: document.getElementById("chorus-btn"),
  current_pos: document.getElementById("current-pos"),
  length: document.getElementById("full-length"),
  blank_screen: document.getElementById("blank-screen"),
};

for (const [name, elem] of Object.entries(main_tools)) {
  console.log({ elem, name });
  switch (name) {
    // ---- Main Tools ----
    case "search_song":
      console.log("Searching for song...");
      elem.addEventListener("click", function scrapText() {
        chrome.runtime.sendMessage({
          sender: "popup",
          cmd: "subtitles.scrap",
        });
      });
      break;

    case "stop_presentation":
      elem.addEventListener("click", async () => {
        chrome.storage.session.set({ title: null }).then(() =>
          chrome.runtime
            .sendMessage({
              sender: "popup",
              cmd: "presentation.stop",
            })
            .then(() => location.reload())
        );
      });
      break;

    case "external_tab":
      elem.addEventListener("click", async () => {
        chrome.windows.create({
          focused: true,
          type: "popup",
          url: "popup/index.html?d",
          width: window.outerWidth + 10,
          height: outerHeight + 40,
        });
      });
      break;

    case "dark_mode":
      elem.addEventListener("change", (e) => {
        console.log("Changing theme");
        chrome.storage.local.set({ theme: elem.checked ? "dark" : "light" });
        document.documentElement.setAttribute(
          "data-theme",
          elem.checked ? "dark" : "light"
        );
      });
      break;
  }
}

function setControlsListeners() {
  const jump_fnc = () =>
    chrome.runtime.sendMessage({
      cmd: "slide.jump",
      data: controls.current_pos.innerText,
    });

  for (const [name, elem] of Object.entries(controls)) {
    switch (name) {
      case "blank_screen":
        elem.addEventListener("change", () => {
          console.log("changing blanking");
          chrome.storage.session.set({ blank: elem.checked });
        });
        break;

      case "chorus_btn":
        elem.addEventListener("click", () =>
          chrome.runtime.sendMessage({ cmd: "slide.jump", data: "chorus" })
        );
        break;

      case "current_pos":
        elem.addEventListener("keypress", (e) => {
          if (e.key == "Enter") {
            if (e.target.innerText != "") jump_fnc();
            elem.blur();
            e.preventDefault();
          } else if (e.key.length == 1 && !/\d+/.test(e.key))
            e.preventDefault();
        });
        break;

      case "left_btn":
      case "right_btn":
        elem.addEventListener("click", () =>
          chrome.runtime.sendMessage({
            cmd: "slide." + (name === "left_btn" ? "prev" : "next"),
          })
        );
        break;
    }
  }
}

function setWindowSize() {
  // updating size of window to fit only the content
  chrome.windows.update(Number(window.name), {
    width: document.body.offsetWidth + 40,
    height: document.body.offsetHeight + 80,
  });
}
chrome.windows.getCurrent().then((id) => (window.name = String(id.id)));

chrome.storage.session.get().then((presentation) => {
  console.log("presentation:", presentation);
  song_info = presentation;
  chrome.windows.getCurrent().then((id) => (window.name = String(id.id)));
  main_tools.external_tab.disabled = location.search !== "";
  let state = presentation.title === undefined || presentation.title === null;
  document.getElementById("presentation-control").hidden = state;
  main_tools.stop_presentation.disabled = state;

  if (location.search !== "") setWindowSize();
  if (state) return;
  setControlsListeners();
  controls.blank_screen.checked = presentation.blank === true;
  controls.title.innerText = presentation.title;
  controls.title.href = presentation.url;
  controls.current_pos.innerText =
    presentation.current === "chorus" ? "Ref." : presentation.current;
  console.log(
    "state:",
    presentation.current === "chorus",
    presentation.chorus === null
  );
  controls.chorus_btn.disabled =
    presentation.current === "chorus" ||
    presentation.chorus === undefined ||
    presentation.chorus === null;
  controls.length.innerText = presentation.verses.length;
});

chrome.storage.session.onChanged.addListener(({ blank, current, title }) => {
  if (blank !== undefined) controls.blank_screen.checked = blank.newValue;
  if (title) location.reload();
  if (current == undefined || current === null) return;
  console.log({ current });
  controls.current_pos.innerText =
    current.newValue == "chorus" ? "Ref." : current.newValue;
  controls.chorus_btn.disabled =
    current.newValue === "chorus" ||
    song_info.chorus === undefined ||
    song_info.chorus == null;
});
