// creating listener for uploading data request
let song_info;
const main_tools = {
  downloaded_list: document.getElementById("downloaded-list"),
  upload_downloaded: document.getElementById("upload-downloaded"),
};

const controls = {
  custom_text: document.getElementById("custom-text"),
};

for (const [name, elem] of Object.entries(main_tools)) {
  console.log({ elem, name });
  switch (name) {
    // ---- Main Tools ----
    case "downloaded_list":
      elem.addEventListener("change", () => {
        main_tools.upload_downloaded.disabled = elem.value == "";
      });
      break;

    case "upload_downloaded":
      elem.addEventListener("click", () => {
        chrome.storage.local.get(["saved"], (e) => {
          console.log(
            "Will be sent:",
            e,
            e.saved[main_tools.downloaded_list.value]
          );
          chrome.runtime.sendMessage({
            sender: "presentation",
            cmd: "subtitles.load",
            data: e.saved[main_tools.downloaded_list.value],
          });
        });
        chrome.runtime.onMessage.addListener((msg)=>{
          if(msg.status == "loaded" && msg.sender == "presentation")
            window.close();
        })
      });
  }
}

function setControlsListeners() {
  controls.custom_text.addEventListener("click", () => {
    let temp = window.open(
      "/custom-text/index.html",
      "_blank",
      "name=custom-text,popup=1,height=385,width=360"
    );
    window.addEventListener("message", (e) => {
      console.log("msg:", e);
      temp.close();
      chrome.runtime.sendMessage({
        sender: "popup",
        url: null,
        cmd: "subtitles.load",
        data: {
          verses: e.data,
          title: e.data[0].slice(0, 15).replace("\n", " ") + "...",
          chorus: null,
        },
      });
      alert();
      chrome.runtime.onMessage.addListener((msg)=>{
        if(msg.status == "loaded" && msg.sender == "presentation")
          window.close();
      })
    });
    window.onclose = () => temp.close();
  });
}

function setWindowSize() {
  // updating size of window to fit only the content
  chrome.windows.update(Number(window.name), {
    width: document.body.offsetWidth + 40,
    height: document.body.offsetHeight + 80,
  });
}

chrome.storage.local.get(["saved"], (out) => {
  setControlsListeners();
  if (out.saved == undefined || out.saved == null) return;
  for (const [id, data] of Object.entries(out.saved)) {
    let elem = document.createElement("option");
    elem.value = id;
    elem.textContent = data.title;
    main_tools.downloaded_list.appendChild(elem);
  }
});
