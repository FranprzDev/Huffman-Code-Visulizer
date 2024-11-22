let text = "";
let input = document.getElementById('input');
let button = document.getElementById('submit');

button.addEventListener('click',()=>{
    text = input.value;
    encodeHuffman(text);
})
