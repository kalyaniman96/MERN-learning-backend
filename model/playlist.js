const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    OTP: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: "../Uploads/userimage.jpg",
      require: false,
    }, // For uploading single image
    // images: {
    //   type: Array,
    //   require: true,
    // }, // For uploading multiple images define an array which accepts only string
    // ctype: String,
    videos: {
      type: Number,
      default: 100,
    },
    author: String,
    active: {
      type: Boolean,
      default: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isDelete: {
      type: String,
      default: "no",
    },
  },
  {
    timestamps: true,
  }
);
//pre-save middleware function for password hashing using bcrypt library
playlistSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;
