document.getElementById("post-text").onclick =  ()=>{
    let text = document.getElementById("custom-text").value;
    window.name="custom-text";
    
    try {
        text = text.split('\n\n');
        text.forEach(a => a.replace(/\s?\n\s?/, '*'))
        window.opener.postMessage(text);   
    } catch (error) {
        console.log(error);
        debugger;
        alert("Coś poszło nie tak... spróbuj ponownie");
        setTimeout(window.close, 300);
    }
}