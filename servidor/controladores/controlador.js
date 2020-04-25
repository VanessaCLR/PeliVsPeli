var con = require("../lib/conexionbd");

function cargarCompetencias(req, res) {
    var sql = "SELECT * FROM competencia";
    con.query(sql, function (error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }
        res.send(JSON.stringify(resultado));
        console.log(resultado);
    });
}

function obtenerOpciones(req, res) {

    var idCompetencia = req.params.id;
    var sqlCompetencia = "SELECT * FROM competencia where id=" + idCompetencia;
    con.query(sqlCompetencia, function (error, result, fields) {
        if (!idCompetencia || isNaN(idCompetencia)) {
            return res.status(422).send("Los valores ingresados no son válidos")
        };
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }
        var competencia = result[0].nombre;
        var genero = result[0].genero_id;
        var actor = result[0].actor_id;
        var director = result[0].director_id;

        var sqlPeliculas = "SELECT pelicula.id, pelicula.poster, pelicula.titulo, pelicula.genero_id from pelicula JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id WHERE 1=1";
        var sqlGenero = genero ? ' AND pelicula.genero_id = ' + genero : '';
        var sqlActor = actor ? ' AND actor_pelicula.actor_id = ' + actor : '';
        var sqlDirector = director ? ' AND director_pelicula.director_id = ' + director : '';
        var orden = ' ORDER BY RAND() LIMIT 2';

        var query = sqlPeliculas + sqlGenero + sqlActor + sqlDirector + orden;

        con.query(query, function (error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
            var peliculas = resultado;
            var respuesta = {
                competencia: competencia,
                peliculas: peliculas
            };
            res.send(JSON.stringify(respuesta));

        });
    });

};

function crearCompetencia(req, res) {
    var competencia = req.body;
    var nombre = competencia.nombre;
    var genero = (competencia.genero > 0) ? competencia.genero : null;
    var director = (competencia.director > 0) ? competencia.director : null;
    var actor = (competencia.actor > 0) ? competencia.actor : null;


    var sqlValidacion = "SELECT DISTINCT p.titulo from pelicula p INNER JOIN actor_pelicula ap ON p.id = ap.pelicula_id JOIN director_pelicula dp ON p.id = dp.pelicula_id WHERE 1=1"
    var sqlGenero = genero ? ' AND p.genero_id = ' + genero : '';
    var sqlActor = actor ? ' AND ap.actor_id = ' + actor : '';
    var sqlDirector = director ? ' AND dp.director_id = ' + director : '';

    var sqlConteo = sqlValidacion + sqlGenero + sqlActor + sqlDirector;
    console.log(sqlConteo);

    con.query(sqlConteo, function (error, resultado, fields) {
        if (error) {
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length >= 2) {
            var sql = "INSERT INTO competencia VALUES (null,'" + nombre + "'," + director + "," + actor + "," + genero + ")";
            con.query(sql, function (error, resultado, fields) {
                if (error) {
                    return res.status(404).send("Hubo un error en la consulta");
                }
                res.send(JSON.stringify(resultado));
                console.log(resultado);
            })   
            
        }else{
            return res.status(422).send("No se puede crear la categoría, introduzca valores válidos");
        }
        
    })    
}

function obtenerDirectores(req, res) {
    var sql = "SELECT id, nombre FROM director ORDER BY nombre";

    con.query(sql, function (error, resultado, fields) {
        if (error) return res.status(500).json(error);
        res.json(resultado)
    })
}

function obtenerActores(req, res) {
    var sql = "SELECT id, nombre FROM actor ORDER BY nombre";

    con.query(sql, function (error, resultado, fields) {
        if (error) return res.status(500).json(error);
        res.json(resultado)
    })
}

function obtenerGenero(req, res) {
    var sql = "SELECT id, nombre FROM genero";

    con.query(sql, function (error, resultado, fields) {
        if (error) return res.status(500).json(error);
        res.json(resultado)
    })
}

function votarCompetencia(req, res) {
    var competencia = req.params.id;
    var pelicula = req.body.idPelicula;
    var sql = "INSERT INTO voto VALUES (null," + competencia + "," + pelicula + ")";
    con.query(sql, function (error, resultado, fields) {
        if (error) {
            return res.status(404).send("Hubo un error en la consulta");
        }
        res.send(JSON.stringify(resultado));
    })
}

function resultadosCompetencia(req, res) {
    var idCompetencia = req.params.id;
    var sqlCompetencia = "SELECT DISTINCT nombre FROM competencia INNER JOIN voto ON competencia.id=" + idCompetencia;
    con.query(sqlCompetencia, function (error, result, fields) {
        if (error) {
            return res.status(404).send("Hubo un error en la consulta");
        }
        var sqlAtributos = "SELECT voto.id_pelicula,pelicula.titulo,pelicula.poster,count(id_pelicula) AS votos FROM voto INNER JOIN pelicula ON voto.id_pelicula=pelicula.id WHERE voto.id_competencia='" + idCompetencia +
            "' GROUP BY voto.id_pelicula ORDER BY votos DESC LIMIT 3";
        con.query(sqlAtributos, function (error, resultado, fields) {
            if (error) {
                return res.status(404).send("Hubo un error en la consulta");
            }
            var competencia = result[0].nombre;
            var resultados = resultado;

            var respuesta = {
                competencia: competencia,
                resultados: resultados
            }
            res.json(respuesta);
            console.log(respuesta)
        })
    })
};

function editarCompetencia(req, res) {
    var idCompetencia = req.params.id;
    var nombre = req.body.nombre;
    var sql = "UPDATE competencia SET nombre='" + nombre + "' WHERE id=" + idCompetencia;
    con.query(sql, function (error, resultado, fields) {
        if (error) {
            return res.status(404).send("Hubo un error en la consulta");
        }
        res.json(resultado);
    })
}
function obtenerDetalles(req, res) {
    var id_competencia = req.params.id;
    var sql = "SELECT DISTINCT c.nombre, g.id AS genero, d.id AS director, c.actor_id AS actor, " +
        " g.nombre AS genero_nombre, a.nombre AS actor_nombre, d.nombre AS director_nombre FROM competencia c " +
        " LEFT join actor_pelicula ap ON c.actor_id = ap.actor_id " +
        " LEFT JOIN actor a ON ap.actor_id = a.id " +
        " LEFT JOIN director_pelicula dp ON c.director_id = dp.director_id " +
        " LEFT JOIN director d ON dp.director_id = d.id " +
        " LEFT JOIN genero g ON c.genero_id = g.id " + " WHERE c.id=" + id_competencia;

    con.query(sql, function (error, resultado, fields) {
        if (error) {
            return res.status(404).send("Hubo un error en la consulta");
        }
        if (resultado.length == 0) {
            return res.status(500).json(error);
        }
        res.json(resultado[0]);
    })
}

function reiniciarCompetencia(req, res) {
    var id_competencia = req.params.id;
    var sql = "DELETE FROM voto WHERE id_competencia=" + id_competencia;
    con.query(sql, function (error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }
        res.json(resultado);
    })

}

function eliminarCompetencia(req, res) {
    var id_competencia = req.params.id;
    var sql = "DELETE FROM competencia WHERE id=" + id_competencia;

    con.query(sql, function (error, resultado, fields) {
        if (error) {
            return res.status(404).send("Hubo un error en la consulta");
        }
        res.json(resultado);

    })
}
module.exports = {
    cargarCompetencias: cargarCompetencias,
    obtenerOpciones: obtenerOpciones,
    crearCompetencia: crearCompetencia,
    obtenerGenero: obtenerGenero,
    obtenerActores: obtenerActores,
    obtenerDirectores: obtenerDirectores,
    votarCompetencia: votarCompetencia,
    resultadosCompetencia: resultadosCompetencia,
    editarCompetencia: editarCompetencia,
    eliminarCompetencia: eliminarCompetencia,
    obtenerDetalles: obtenerDetalles,
    reiniciarCompetencia: reiniciarCompetencia
}