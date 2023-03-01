const ref_rgx = /(?:<em>ref\.*\W*<\/em>)\W*(?<text>.+)/i
const title_rgx = /(?:0{0,3})(?<text>\d+\..+)/
function textParser(){
    // scraping its content
    // element where the whole text is stored 
    const htmlElem = document.getElementsByClassName("article-content")[0];
    // const title = ;
    // console.log(title);

    const song = {
        title: document.getElementsByClassName("article-title")[0].textContent.match(title_rgx).groups.text.replace(/\t+/, ''),
        chorus: null, 
        verses: new Array(),
        first_chorus: false,
        url: window.location.href
    } // base, scheme
    if(htmlElem.innerHTML.includes("<ol>")){
        console.log("It got list");
        let len;
        // parsing each li element from ol element
        for (const li of htmlElem.getElementsByTagName("li")) {
            // looking for chrous in each line
            len = Number(li.innerHTML.indexOf("<br><em>Ref"));
            song.verses.push(li.innerHTML.slice(0, len<0 ? li.innerHTML.length : len))
            // if found, saveit
            if(len >= 0) 
                song.chorus = li.innerHTML.match(ref_rgx).groups.text;
            
        }
        // if not found chorus in li elements, but found in whole element, get it
        if(
            !song.chorus && htmlElem.querySelector("p") && 
            htmlElem.querySelector("p").textContent.includes("Ref")
        ){
            song.chorus = htmlElem.querySelector("p").innerHTML.match(ref_rgx)?.groups.text;
            song.first_chorus = true;
        }

        return song;
    }
    // parsing text from non-list objects
    for (const p of htmlElem.getElementsByTagName("p")) {
        song.verses.push(p.innerHTML);
    }
    return song;
}

function postSong(){
        chrome.runtime.sendMessage({
            sender: "scrapper",
            cmd: "subtitles.load",
            data: textParser()
        })
    
}

// inserting button posting subtitles uppder
const btn = document.createElement("button")
btn.setAttribute("id", "my_custom_btn");
btn.innerText = "Załaduj tekst tej pieśni";
btn.onclick = postSong;
document.body.appendChild(btn);