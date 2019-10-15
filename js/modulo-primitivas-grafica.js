var botaoCriarPrimitivaGrafica = document.querySelector("#criar-primitiva");
console.log(botaoCriarPrimitivaGrafica);

botaoCriarPrimitivaGrafica.addEventListener("click", function(){
    event.preventDefault();
    
    var form = document.querySelector("#dados-primitiva");
    console.log(form);


    var posicaoX = form.querySelector("#posicao-x");
    posicaoX = posicaoX.value;
    

    var posicaoY = form.querySelector("#posicao-y");
    posicaoY = posicaoY.value;

    var altura = form.querySelector("#altura");
    altura = altura.value;

    var largura = form.querySelector("#largura")
    largura = largura.value;

    console.log(posicaoX, posicaoY, altura, largura)

    
    const canvas = document.getElementById('tela-desenho');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.fillRect(posicaoX, posicaoY, largura, altura);
})