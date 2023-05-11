"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios=require("axios");
const app = express();
const moviesData = require("./data.json");
// const port = 3001;
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());
app.use(express.json());
const MoviesKey = process.env.API_KEY;
const port=process.env.PORT;
// let result=[];
function Movie(id,title,release_date, path, overview) {
  this.id=id;
  this.title = title;
  this.release_date=release_date;
  this.path = path;
  this.overview = overview;
  // result.push(this);
}

// routes =================

app.get("/", handleHome);
app.get("/discovermovies",handleDiscoverMovies)
app.get("/favorite", handleFavorite);
app.get("/nameofmovie",handlenameofmovie)
app.get("/discovertv",handleDiscoverTv)
app.get("/trending",handelTrending)
app.get("/getmovies",getMoviesHandel)
app.get("/getmovie/:id",getMovieOneHandel)
app.post("/addemovie",addMovieHandel)
app.delete("/deletemovie/:id",deleteMovieHandel)
app.put("/updatemovie/:id",updateMovieHandel)


// handlers ===============
function handleHome(req,res){
  res.send("Welcome to MoviesFinder");

}

function deleteMovieHandel(req,res){
   const movieid =req.params.id;
   const sql=`delete from movies where id=${movieid} ; `
   client.query(sql).then((data)=>{
      res.status(202).send('deleted')
   })
}
function getMovieOneHandel(req,res){
  const movieid =req.params.id;
  const sql=`select * from movies where id=${movieid};`
  // console.log(sql)
  client.query(sql).then((data)=>{
    res.status(200).json(data.rows);
  })
}
function updateMovieHandel(req,res){
  const movieid =req.params.id;
  const sql=`update movies set title=$1,release_date=$2,imeg_path=$3,overview=$4 where id=${movieid} ; `
  const values=[req.body.title,req.body.release_date,req.body.imeg_path,req.body.overview];
  client.query(sql,values).then((data)=>{
    res.status(200).send(data.rows);
  })
}
function addMovieHandel(req,res){
  const movie=req.body;
  console.log(movie)
  // const sql=`INSERT into movies (id,title,release_date,path,overview) values ('${movie.id}','${movie.title}','${movie.release_date}','${movie.path}','${movie.oneMovie}');`;
  const sql = `INSERT into movies (title,release_date,path,overview) values ($1,$2,$3,$4) RETURNING *;`;
  const values=[movie.title,movie.release_date,movie.path,movie.overview];
  client.query(sql,values).then((data)=>{
    res.status(201).send(data.rows);
  })
}

function getMoviesHandel(req,res){
   const sql = 'select * from movies;';
   client.query(sql).then((data)=>{
    // res.send(data.rows);
    let moviesFromDB = data.rows.map((item)=>{
      let oneMovie= new Movie(
        item.id,
        item.title,
        item.release_date,
        item.path,
        item.overview
      )
      return oneMovie;
    })
    res.status(200).send(moviesFromDB);
   })
}

async function handleDiscoverMovies(req, res) {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${MoviesKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`;
 let movieFromAPI =await axios.get(url);
 let moves=movieFromAPI.data.results.map((item)=>{
  return new Movie(item.id,item.original_title,item.release_date,item.poster_path,item.overview)
 })
 res.json(moves);
}

async function handleDiscoverTv(req,res){
  const url=`https://api.themoviedb.org/3/discover/tv?api_key=${MoviesKey}&language=en-US&sort_by=popularity.desc&page=1&timezone=America%2FNew_York&include_null_first_air_dates=false&with_watch_monetization_types=flatrate&with_status=0&with_type=0`
  let TvFromAPI = await axios.get(url);
  let tvShow=TvFromAPI.data.results.map((item)=>{
  return new Movie(item.id,item.original_title,item.release_date,item.poster_path,item.overview)
 })
 res.json(tvShow);
}
function handlenameofmovie(req,res){
  let searchByName=req.query.search
  const url =`https://api.themoviedb.org/3/search/company?api_key=${MoviesKey}&query=${searchByName}`

  axios.get(url).then((result)=>{
    // console.log(result)
  res.send(result.data);
  })
}

async function handelTrending(req,res){
  const url=`https://api.themoviedb.org/3/trending/all/day?api_key=${MoviesKey}`;
  let movieFromAPI=await axios.get(url);
  let moves=movieFromAPI.data.results.map((item)=>{
    return new Movie(item.id,item.original_title,item.release_date,item.poster_path,item.overview)
  })
  res.json(moves);
}

function handleFavorite(req, res) {
  res.send("Welcome to Favorite Page");
}

/// errors
app.get("*", (req, res) => {
  res.send("page not found error");
});
app.use(InternalServerError);
function InternalServerError(req, res) {
  res.status(500).send("Internal Server Error");
}

client.connect().then(()=>{

  app.listen(port, () => {
    console.log(`server is listining on port`,port);
  });
})
