const express = require("express");
const path = require("path");

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname,"moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
    try {
            db = await open(
            {
                filename: dbPath,
                driver: sqlite3.Database
            }
        );
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/");
        });
    } catch(e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
}

initializeDBAndServer();

const convertMovieDBObjectToResponseObject = (dbObject) => {
    return {
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor
    };
};

const convertDirectorDBObjectToResponseObject = (dbObject) => {
    return {
        directorId: dbObject.director_id,
        directorName: dbObject.director_name
    };
};

//Get Movies API
app.get("/movies/", async (request, response) => {
    const getMoviesQuery = `
    SELECT 
      movie_name
    FROM 
      movie
    ORDER BY movie_id;`;
    const moviesArray = await db.all(getMoviesQuery);
    response.send(
        moviesArray.map((eachMovie) => ({movieName: eachMovie.movie_name}))
      );
});

//Add Movie API
app.post("/movies/",async (request, response) => {
    const movieDetails = request.body;
    const {directorId, movieName, leadActor} = movieDetails;
    const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES
      (${directorId}, '${movieName}', '${leadActor}');`;
    await db.run(addMovieQuery);
    response.send("Movie Successfully Added");
});

//Get Movie API
app.get("/movies/:movieId/", async (request, response) => {
    const {movieId} = request.params;
    const getMovieQuery = `
    SELECT 
      * 
    FROM
      movie
    WHERE 
    movie_id = ${movieId};`;
    const movie = await db.get(getMovieQuery);
    response.send(
        convertMovieDBObjectToResponseObject(movie)
      );
});

//Update Movie API
app.put("/movies/:movieId/", async (request, response) => {
    const {movieId} = request.params;
    const movieDetails = request.body;
    const {directorId, movieName, leadActor} = movieDetails;
    const updateMovieQuery = `
    UPDATE
      movie
    SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE
      movie_id = ${movieId};`;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

//Delete Movie API
app.delete("/movies/:movieId/", async (request, response) => {
    const {movieId} = request.params;
    const deleteMovieQuery = `
    DELETE FROM 
      movie
    WHERE 
      movie_id = ${movieId};`;
    await db.run(deleteMovieQuery);
    response.send("Movie Removed");
});

//Get Movie Directors API
app.get("/directors/", async (request, response) => {
    const getDirectorsQuery = `
    SELECT
      *
    FROM 
      director
    ORDER BY
      director_id;`;
    const directorsArray = await db.all(getDirectorsQuery);
    response.send(
        directorsArray.map((eachDirector) => convertDirectorDBObjectToResponseObject(eachDirector))
      );
});

//GET Specific Director Movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
    const {directorId} = request.params;
    const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id = ${directorId};`;
    const directorMoviesArray = await db.all(getDirectorMoviesQuery);
    response.send(
        directorMoviesArray.map((eachMovie) => ({movieName: eachMovie.movie_name}))
      );
});

module.exports = app;