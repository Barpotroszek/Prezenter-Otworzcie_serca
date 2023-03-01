console.log("work in progress...");
const storage = new Object({
  scrap: undefined,
  presenter: false,
  data: undefined,
});
let received = 0;

// Setting listener for messages
chrome.runtime.onMessage.addListener(async (msg) => {
  console.log("NEW MSG:", msg);

  // Filtering messages from popup/management center
  if (msg.sender === "popup") {
    if (msg.cmd === "subtitles.scrap") {
      // creating tab with page intended to scrap its content
      storage.scrap = (
        await chrome.windows.create({
          focused: true,
          type: "popup",
          url: "http://otworzcieserca.pl/cala-zawartosc/",
        })
      ).tabs[0].id;
      // console.log({ ...storage });
      return;
    }
    if (msg.cmd === "presentation.stop") {
      storage.presenter = undefined;
    }
  }

  // Filtering messages from scrapper
  // console.log("MESSAGEE:", msg);
  if (msg.cmd === "subtitles.load") {
    // if (!storage.scrap) return;

    try {
      chrome.tabs.remove(storage.scrap).catch(() => {}); // closing useless tab/winodw
    } catch (error) {}

    console.log("DATA:", msg.data);
    storage.data = msg.data;

    // if there is opened presentation window, quit
    // data should be updated, because of the message this listener was invoked
    try {
      await chrome.tabs.get(storage.presenter);
    } catch (err) {
      // else create this one
      console.log("GOt error, but idc");
      let tmp = await chrome.windows.create({
        focused: true,
        type: "popup",
        // state: "fullscreen",
        url: "/presentation/index.html",
      });
      storage.presenter = tmp.tabs[0].id;
      tmp.alwaysOnTop = true;
    }
    return;
  }

  // fire when the presenter is ready, send it data
  if (msg.sender === "presentation") {
    if (msg.status === "ready") {
      chrome.runtime.sendMessage({ cmd: "subtitles.load", data: storage.data });
      storage.presenter = msg.data;
    }
  }
});
