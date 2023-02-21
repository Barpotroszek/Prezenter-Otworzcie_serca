class Presentation {
  constructor(data) {
    // if(data !== undefined)
    this.title = data ? data.title : null;
    this.chorus = data ? data.chorus : null;
    this.verses = data ? data.verses : ["Tekst tymczasowy..."];
    this.url = data ? data.url : null;
    this.current = null;
    this.previous = null;
    // this.length = this.verses.length;
    this.first_chorus = data ? data.first_chorus : true;
    chrome.storage.session.set(this);
    this.loadSlide(this.first_chorus ? "chorus" : 1);
  }
  
  loadSlide(id) {
    id = id || 1;
    console.log(
      { id, len: this.verses.length },
      this.verses.length >= id,
      id > 0
    );
    if (isNaN(id) && id == "chorus") {
      document.body.innerHTML = this.chorus;
      this.current = id;
    } else {
      id = this.verses.length >= id ? id : this.verses.length;
      id = id > 0 ? id : 1;
      this.current = id;
      document.body.innerHTML = this.verses[this.current - 1];
    }
    chrome.storage.session.set({
      previous: this.previous,
      current: this.current,
    });
  }

  nextSlide() {
    // console.log(this);
    let temp = this.current; // value will be set to previous
    if (this.current == "chorus" && this.previous !== this.verses.length) {
      // currently is chorus
      this.loadSlide(this.previous == null ? 1 : this.previous + 1);
    } else if (!isNaN(this.current) && this.current < this.verses.length) {
      // currently is verse and it's not the last one
      if (this.chorus !== null)
        // song has chorus
        this.current = "chorus";
      // in the other case load next verse
      else this.current += 1;
      this.loadSlide(this.current);
    } else if (this.current == this.verses.length && this.chorus !== null) {
      this.current = "chorus";
      this.loadSlide("chorus");
    } else return;
    this.previous = temp;
    // console.log(this);
  }

  previousSlide() {
    // console.log(this);

    let temp = this.current; // value will be set to previous

    if (this.previous === 1 && !this.first_chorus) {
      // previous is verse that song start from
      temp = null;
    } else if (this.previous === 1 && this.first_chorus) {
      // if next one is verse and song starts from chorus,
      // -> set "previous" to chorus
      temp = "chorus";
    } else if (
      (this.current === 1 && this.first_chorus) || // currently is verse and song starts from chorus
      (!isNaN(this.current) && this.current > 1) // or it's verse, but not the first one
    ) {
      if (this.chorus !== null) {
        // if song has chorus
        this.previous = "chorus"; // next chorus will be displayed
        temp = isNaN(this.current) ? null : this.current - 1; // and set previous verse...
      }
      // in the other case previous verse will be displayed
      else temp = this.previous - 1;
    } else if (this.current === "chorus" && this.previous > 1) {
      // simply going back from chorus, close to the upper one, but case when chorus are displayed
      // nothing happens, but it needs to be, because of "return" below
    } else return;
    this.current = this.previous;
    this.previous = temp;
    this.loadSlide(this.current);

    // console.log(this);
    // console.log("END");
  }

  jumpTo(id) {
    console.log(this);
    this.previous = this.current;
    this.loadSlide(id === "chorus" ? id : Number(id));
    console.log(this);
  }
}

let current_song = new Presentation();
function loadData(data) {
  current_song = new Presentation(data);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.cmd === "presentation.stop") window.close()
  else if (msg.cmd === "subtitles.load") {
    // console.log("New data", msg);
    loadData(msg.data);
    chrome.runtime.sendMessage({ sender: "presentation", status: "loaded" });
  }
  if (msg.cmd === "slide.next") current_song.nextSlide();
  else if (msg.cmd === "slide.prev") current_song.previousSlide();
  else if (msg.cmd === "slide.jump") current_song.jumpTo(msg.data);
});

document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "ArrowRight") current_song.nextSlide();
  if (e.key === "ArrowLeft") current_song.previousSlide();
});

chrome.tabs.getCurrent((tab) =>
  chrome.runtime.sendMessage({
    sender: "presentation",
    status: "ready",
    data: tab.id,
  })
);

loadData();

window.onclose = async ()=>
  await chrome.storage.session.set({ title: null, verses: null});
window.addEventListener("beforeunload", window.onclose);