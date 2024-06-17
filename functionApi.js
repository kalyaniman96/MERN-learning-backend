//Importing required modules
const http = require("http"); //Provides functionality to create HTTP servers and make HTTP requests.
const fs = require("fs"); //Provides file system-related functionality for reading, writing, and manipulating files.
require("dotenv").config();
const conn = require("./Db/conn");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const router = new express.Router();
const Playlist = require("./model/playlist");
//Defining constants

const hostname = process.env.hostname; //Specifies the hostname for the server
const port = process.env.port;

const insertData = async () => {
  try {
    // const nodePlaylist = new Playlist({
    //   name: "Node JS",
    //   ctype: "BackEnd",
    //   videos: 50,
    //   author: "Molay",
    //   active: true,
    // });
    // const reactPlaylist = new Playlist({
    //   name: "React JS",
    //   ctype: "FrontEnd",
    //   videos: 70,
    //   author: "Iman",
    //   active: true,
    // });
    // const mongoPlaylist = new Playlist({
    //   name: "MongoDB",
    //   ctype: "Database",
    //   videos: 30,
    //   author: "Swagata",
    //   active: true,
    // });
    //  const ExpressPlaylist = new Playlist({
    //   name: "ExpressJS",
    //   ctype: "BackEnd",
    //   videos: 45,
    //   author: "Debdeep",
    //   active: true,
    // });
    const NextPlaylist = new Playlist({
      name: "NextJS",
      ctype: "Fullstack",
      videos: 50,
      author: "Iman",
      active: true,
    });

    const result = await Playlist.insertMany([
      // nodePlaylist,
      // reactPlaylist,
      // mongoPlaylist,
      // ExpressPlaylist,
      NextPlaylist,
    ]);
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

// insertData(); // for inserting new entries in the database

//To read data from the database//
const getData = async () => {
  try {
    const result = await Playlist.find({
      ctype: "BackEnd",
    })
      .select({ name: 1 })
      .sort({ name: -1 });
    //.countDocuments();
    //.limit(1)
    //.skip(1);
    console.log(`All data: ${result}`);
  } catch (err) {
    console.log(err);
  }
};
// getData();

//To get a specific data based on id
const getDataById = async (id) => {
  try {
    const result = await Playlist.find({
      _id: id,
    })
      .select({ name: 1, author: 1, ctype: 1, videos: 1 })
      .sort({ name: -1 });
    //.countDocuments();
    //.limit(1)
    //.skip(1);
    console.log(`All data: ${result}`);
  } catch (err) {
    console.log(err);
  }
};
// getDataById("65e34d458a3976804f7e2f00");

//Update any specific data and return it
const updateData = async (id) => {
  try {
    const result = await Playlist.findOneAndUpdate(
      { _id: id },
      { videos: 90 },
      { new: true } // To return the updated document
    );

    console.log(`Updated Data: ${result}`);
  } catch (err) {
    console.log(err);
  }
};
// updateData("65e34d458a3976804f7e2eff");

//Update data using $set
const update = async (id) => {
  try {
    const result = await Playlist.updateOne(
      { _id: id },
      { $set: { videos: 70, name: "Next js" } }
    );

    console.log("Data updated succesfully");
  } catch (err) {
    console.log(err);
  }
};

// update("65e34d458a3976804f7e2f00");

//Delete any specific data
const deleteDataById = async (id) => {
  try {
    const result = await Playlist.find({
      // _id: "65e34d458a3976804f7e2eff",
      _id: id,
    }).deleteOne();
    console.log(`Data deleted successfully`);
  } catch (err) {
    console.log(err);
  }
};
// deleteDataById("65e34d458a3976804f7e2f02");

//Server setup for listening
//Makes the server start listening for incoming connections on the specified port (8080 in this case) and hostname. Once the server starts listening, it logs a message to the console.
const server = http.createServer(function (req, res) {
  // Handle HTTP request errors
  req.on("error", function (err) {
    console.error(err);
    res.statusCode = 400;
    res.end("Error occurred while processing your request");
  });

  res.on("error", function (err) {
    console.error(err);
  });

  //If there is no error then write "HELLO user" as the response to the client
  res.statusCode = 200;
  // res.setHeader("Content-Type", "text/plain");
  // res.write("HELLO Iman");
  res.end();
});
server.listen(port, hostname, () => {
  console.log(`Server listening on http://${hostname}:${port}/`);
});
