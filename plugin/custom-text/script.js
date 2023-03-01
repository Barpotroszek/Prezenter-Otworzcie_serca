document.getElementById("post-text").onclick =  ()=>{
    let text = document.getElementById("custom-text").value;
    window.name="custom-text";
    try {
        window.opener.postMessage(text);        
    } catch (error) {
        alert("Coś poszło nie tak... spróbuj ponownie");
        setTimeout(window.close, 300);
    }
}