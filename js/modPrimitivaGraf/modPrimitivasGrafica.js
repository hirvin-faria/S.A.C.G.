
//Define a funcao vertexShader
const vertexShaderSource =
[
    'precision mediump float;',
    '',
    'attribute vec2 vertPosition;',
    'attribute vec3 vertColor;',
    '',
    'varying vec3 fragColor;',
    '',
    'void main() {',
    '',
    '  fragColor = vertColor;',
    '  gl_Position = vec4(vertPosition, 0.0, 1.0);',
    '',
    '}'
].join('\n');

//Define a funcao fragmentShader
const fragmentShaderSource =
[
    'precision mediump float;',
    '',
    'varying vec3 fragColor;',
    '',
    'void main() {',
    '',
    '  gl_FragColor = vec4(fragColor, 1.0);',
    '',
    '}',
    '',
    ''
].join('\n');

//Constantes 
var gl;
var canvas;
var program;

//Funcao que inicializa o WebGL
function initWebgl() {
    
    console.log("initWebgl executando...");


    //Recupera o elemento canvas
    canvas = document.getElementById('tela-desenho');


    //Inicializa contexto WebGL
    gl = canvas.getContext('webgl');

    if(!gl) {
        console.log("Mudando para WebGL experimental");
        gl = canvas.getContext('experimental-webgl');
    }

    if(!gl) {
        alert("WebGL nao suportado");
    }


    //Pinta o fundo 
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //Cria e designa as funcoes de shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);


    //Compila e testa os shaders
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("Erro de compilacao no vertex shader", gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("Erro de compilacao no fragment shader", gl.getShaderInfoLog(fragmentShader));
        return;
    }


    //Cria e linka o programa de graficos a partir dos shaders
    program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Erro na linkagem do programa', gl.getProgramInfoLog(program));
        return;
    }

    //Teste de validacao - nao e necessario e pode ser apagado
    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error('Erro na validacao do programa');
        return;
    }

    /*
    //Cria o buffer - tirar dessa funcao depois
    var verticesTriangulo = 
    [// X    Y             R  G  B
        0.0, 0.5,          1.0, 1.0, 0,
        -0.5, -0.5,        0, 1.0, 1.0,
        0.5, -0.5,         1.0, 0, 1.0,
    ];

    var bufferVerticesTriangulo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVerticesTriangulo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesTriangulo), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        positionAttribLocation, //Local dos atributos
        2, //Numero de elementos por atributo (no caso, as duas coordenadas e tres cores)
        gl.FLOAT, //Tipo dos elementos
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //Tamanho em bytes de um vertice
        0 //Offset
    );
    
    gl.vertexAttribPointer(
        colorAttribLocation , //Local dos atributos
        3, //Numero de elementos por atributo (no caso, as duas coordenadas e tres cores)
        gl.FLOAT, //Tipo dos elementos
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //Tamanho em bytes de um vertice
        2 * Float32Array.BYTES_PER_ELEMENT //Offset
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);


    //Desenha o triangulo
    gl.useProgram(program);
    //gl.drawArrays(gl.TRIANGLES, 0, 3);
    */
}
initWebgl();

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

    //var altura = form.querySelector("#altura");
    //altura = altura.value;

    //var largura = form.querySelector("#largura")
    //largura = largura.value;

    console.log(posicaoX, posicaoY);

    //Cria o buffer - tirar dessa funcao depois
    var verticesTriangulo = 
    [// X    Y                                R  G  B
        posicaoX, posicaoY,       1.0, 1.0, 0,
        posicaoX - 0.5, posicaoY - 1.0,        0, 1.0, 1.0,
        posicaoX + 0.5, posicaoY - 1.0,         1.0, 0, 1.0,
    ];

    var bufferVerticesTriangulo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVerticesTriangulo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesTriangulo), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        positionAttribLocation, //Local dos atributos
        2, //Numero de elementos por atributo (no caso, as duas coordenadas e tres cores)
        gl.FLOAT, //Tipo dos elementos
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //Tamanho em bytes de um vertice
        0 //Offset
    );
    
    gl.vertexAttribPointer(
        colorAttribLocation , //Local dos atributos
        3, //Numero de elementos por atributo (no caso, as duas coordenadas e tres cores)
        gl.FLOAT, //Tipo dos elementos
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //Tamanho em bytes de um vertice
        2 * Float32Array.BYTES_PER_ELEMENT //Offset
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);


    //Desenha o triangulo
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    //const canvas = document.getElementById('tela-desenho');
    //const ctx = canvas.getContext('2d');
    //ctx.fillStyle = 'green';
    //ctx.fillRect(posicaoX, posicaoY, largura, altura);
})
