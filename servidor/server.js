//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controlador = require('./controladores/controlador');

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.get("/competencias" , controlador.cargarCompetencias); 
app.get("/generos" , controlador.obtenerGenero); 
app.get("/directores" , controlador.obtenerDirectores);
app.get("/actores" , controlador.obtenerActores);  
app.post("/competencias", controlador.crearCompetencia);
app.get("/competencias/:id/peliculas", controlador.obtenerOpciones);
app.post("/competencias/:id/voto", controlador.votarCompetencia);
app.get("/competencias/:id/resultados", controlador.resultadosCompetencia);
app.get("/competencias/:id", controlador.obtenerDetalles);
app.put("/competencias/:id", controlador.editarCompetencia);
app.delete("/competencias/:id/votos", controlador.reiniciarCompetencia);
app.delete("/competencias/:id", controlador.eliminarCompetencia);

var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});

