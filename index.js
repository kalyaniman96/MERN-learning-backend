//Importing required modules
const http = require("http"); //Provides functionality to create HTTP servers and make HTTP requests.
const fs = require("fs"); //Provides file system-related functionality for reading, writing, and manipulating files.
const path = require("path");
require("dotenv").config();
const conn = require("./Db/conn");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
// const router = new express.Router();
const Playlist = require("./model/playlist");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cron = require("node-cron");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const upload = require("./Middleware/upload");

//Defining constants

const hostname = process.env.hostname; //Specifies the hostname for the server
const port = process.env.port;
const secret = process.env.secret;

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Serve static files from the 'uploads' directory
//express.static is a built-in middleware function in Express. It serves static files, such as images, CSS files, and JavaScript files.
//Syntax: express.static(root, [options])
//The root parameter specifies the root directory from which to serve static assets.
app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Allow only specific headers
  })
);

//Adding new document to database
//Using middleware for uploading image
app.post("/insertdata", upload, async (req, res) => {
  try {
    // console.log("allData", req.file.filename);

    const newDocument = new Playlist({
      name: req.body.name,
      email: req.body.email,
      videos: req.body.videos,
      active: req.body.active,
      author: req.body.author,
      password: req.body.password,
      //for uploading single image
      // image: req.file?.filename,
      image: req.file ? req.file.filename : undefined,
      //for uploading multiple images (multer middleware for multiple files stores the files in req.files instead of req.file)
      // images: req.files.map((file) => file.filename), // Save the filenames of all uploaded images
    });
    const dataInserted = await newDocument.save();
    console.log("+++ API response: ", dataInserted);
    if (dataInserted) {
      res.status(200).json({
        status: "200",
        message: "Data Inserted successfully",
        fulldata: dataInserted,
      });
    }
  } catch (err) {
    res.send(err);
  }
});
// Login verification without JWT token
// app.post("/login", async (req, res) => {
//   try {
//     const password = req.body.password;
//     const email = req.body.email;
//     // console.log(email, password);

//     const userPresent = await Playlist.findOne({ email: email });
//     // console.log(userPresent);
//     if (!userPresent) {
//       return res
//         .status(401)
//         .json({ msg: "Email ID or Password mismatching!!!" });
//     } else {
//       const isPasswordValid = await bcrypt.compare(
//         password,
//         userPresent.password
//       );
//       console.log(isPasswordValid);

//       if (isPasswordValid) {
//         return res.status(200).json({ msg: "Login successful", userPresent });
//       } else {
//         return res
//           .status(404)
//           .json({ msg: "Email ID or Password mismatching!!!" });
//       }
//     }
//   } catch (err) {
//     res.status(500).json({ error: err });
//     console.log(err);
//   }
// });

//user authentication & authorization with JsonWebToken
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    let userPresent = await Playlist.findOne({ email: email });
    console.log("user data: ", userPresent);
    if (!userPresent) {
      return res.status(401).json({ msg: "email or password is incorrect!" });
    } else {
      const isPasswordValid = await bcrypt.compare(
        password,
        userPresent.password
      );
      if (!isPasswordValid) {
        return res.status(404).json({ msg: "email or password is incorrect!" });
      } else {
        //If user is validated then generate jwt token
        const token = jwt.sign({ userId: userPresent._id }, secret);
        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 50000),
          httpOnly: true,
        });
        res.json({
          status: 200,
          message: "Login successful",
          logindata: userPresent,
          token: token,
        });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

//To access protected data using jwt token
app.get("/protected", async (req, res) => {
  //verufy JWT token
  const token = req.headers.authorization;
  // console.log(`Token: ${token}`);
  if (!token) {
    return res
      .status(401)
      .json({ error: "You are not authorized to access the data!" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    // Access protected data
    res.json({ message: "Protected resources accessed", user: decoded });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// User registration
app.post("/signup", async (req, res) => {
  try {
    // console.log("allData", req.files);
    const newDocument = new Playlist({
      name: req.body.name,
      email: req.body.email,
      // videos: req.body.videos,
      // author: req.body.author,
      password: req.body.password,
      // active: req.body.active,
    });
    const dataInserted = await newDocument.save();
    if (dataInserted) {
      res.json({
        message: "Data Inserted successfully",
        fulldata: dataInserted,
      });
    }
  } catch (err) {
    res.send(err);
  }

  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    from: "morekilometersmorefun@gmail.com",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Compose email
  const mailOptions = {
    from: "morekilometersmorefun@gmail.com",
    to: req.body.email,
    subject: "User Registration",
    text: `Congratulations , you have successfully registered on our website , please click on the following link to login >> ${"http://localhost:3000/login"}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred while sending email:", error);
      return res.status(500).json({ message: "Failed to send email" });
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "email sent" });
    }
  });
});

//sending emails using nodemailer
app.post("/sendmail", async (req, res) => {
  try {
    // console.log(req.body.email);
    const otp = crypto.randomInt(1000, 9999);
    console.log(otp);
    const imageUrl = req.query.image;
    let mailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      from_name: "mail test",
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
    let mailDetails = {
      // from: 'souvickjash0011@gmail.com',
      from: "morekilometersmorefun@gmail.com",
      to: req.body.email,
      subject: "Test mail",
      text: "Mail Done",
      html: `<html><body>Your OTP is ${otp}</body></html>`,
    };
    mailTransporter.sendMail(mailDetails, (err) => {
      if (err) {
        console.log("Oops , couldn't send the mail!", err);
        return res.status(404).json({
          status: "404",
          message: "Not found",
        });
      } else {
        console.log("Email sent successfully");
        return res.status(200).json({
          status: "200",
          message: "success",
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "500",
      message: "Internal Server Error",
    });
  }
});

// Forgot password endpoint
app.post("/forgotpassword", async (req, res) => {
  try {
    // Retrieve user email from request body
    const userEmail = req.body.email;

    // Generate a random OTP
    const otp = crypto.randomInt(1000, 9999);

    // Find if the user exists by checking if the email matches
    const userExists = await Playlist.findOne({
      email: userEmail,
    });

    // Check if user exists
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    } else {
      await Playlist.updateOne(
        { email: userEmail },
        { $set: { OTP: otp } },
        { new: true }
      );

      setTimeout(async () => {
        // Reset OTP after 5 minutes
        await Playlist.updateOne({ email: userEmail }, { $set: { OTP: null } });
      }, 5 * 60 * 1000); // 5 minutes in milliseconds

      // Create email transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        from: "morekilometersmorefun@gmail.com",
        auth: {
          user: process.env.user,
          pass: process.env.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Compose email
      const mailOptions = {
        from: "morekilometersmorefun@gmail.com",
        to: userEmail,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}. Please use it within 5 minutes.`,
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error occurred while sending email:", error);
          return res.status(500).json({ message: "Failed to send OTP email" });
        } else {
          console.log("Email sent:", info.response);
          res.status(200).json({ message: "OTP sent to your email" });
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Reset password API
app.post("/resetpassword", async (req, res) => {
  try {
    const { otp, email, newPassword, confirmPassword } = req.body;
    console.log(otp);
    // Find the user by ID
    const user = await Playlist.findOne({
      email: email,
      OTP: otp,
    });
    console.log("User Data: ", user);
    // Check for OTP match
    if (!user) {
      return res.status(404).json({ message: "Invalid OTP" });
    } else {
      if (newPassword !== confirmPassword) {
        return res
          .status(404)
          .json({ message: "password and confirmPassword not matching" });
      } else {
        // Reset password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("+++ New Password (encrypted) :", hashedPassword);
        user.password = hashedPassword;
        user.OTP = null; //Unset OTP

        const allData = await Playlist.updateOne(
          { email: email },
          { $set: user }
        );
        console.log(allData);

        return res.status(200).json({ message: "Password reset successful" });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET method to fetch all data
// app.get("/getdata", async (req, res) => {
//   try {
//     const allData = await Playlist.find();
//     res.json({
//       status: "200",
//       message: "Data Inserted successfully",
//       fulldata: allData,
//     });
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// });

// GET method to fetch all data, sorted by the insertion date in descending order
app.get("/getdata", async (req, res) => {
  try {
    const allData = await Playlist.find({ isDelete: "no" }).sort({
      createdAt: -1,
    });

    if (!allData) {
      res.status(404).json({
        status: "404",

        message: "Data not found",
      });
    } else {
      res.status(200).json({
        status: "200",
        message: "All details",
        fulldata: allData,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "500",
      message: err,
    });
  }
});

// GET method to fetch a specific data by ID
app.get("/getdata/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Playlist.findOne({ _id: id });
    console.log(data);

    if (!data) {
      res.status(404).json({
        status: "404",
        message: "Data not found with the provided ID",
      });
    } else {
      res.status(200).json({
        status: "200",
        message: "User found",
        userData: data,
      });
    }
  } catch (err) {
    // Handle errors such as invalid ID format or database errors
    res.status(500).json({ message: err.message });
  }
});

// app.get("/records", async (req, res) => {
//   try {
//     const letter = await req.query.f_letter.toLowerCase();
//     const filteredRecords = await req.body.records.filter((record) =>
//       record.name.toLowerCase().startsWith(letter)
//     );
//     res.json(filteredRecords);
//   } catch (err) {
//     console.log(err);
//   }
// });

//searching data from database using first letter of name
app.get("/getByName/:key", async (req, res) => {
  try {
    const name = req.params.key;
    console.log(name);
    // let f = "^" + name;
    // let l = name + "$";

    const nameExist = await Playlist.find({
      //for searching data using first name
      // name:{$regex: f, $options: "i"},
      //for searching data using last name
      // name:{$regex: l, $options: "i"},
      //for searching data using middle name
      name: { $regex: name, $options: "i" },
    });
    if (nameExist.length == 0) {
      return res.status(404).json({ msg: "User not found." });
    } else res.status(200).json(nameExist);
  } catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
});

// getting data based on date
// app.get("/getByDate", async (req, res) => {
//   try {
//     // console.log("data from");
//     const getDate = await Playlist.find({
//       createdAt: {
//         $gte: "2024-03-21T17:21:22.984+00:00",
//         $lt: "2024-03-24T17:21:22.984+00:00",
//       },
//     });
//     console.log(getDate);
//   } catch (err) {
//     console.log(err);
//   }
// });

//getting data based upon date passed in postman body
app.get("/getByDate", async (req, res) => {
  try {
    // console.log("data from");
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const dateExists = await Playlist.find({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    return res.json({
      status: "200",
      message: "Data found",
      data: dateExists,
    });
    console.log(dateExists);
  } catch (err) {
    console.log(err);
  }
});

// update data by Id
app.put("/updateData/:id", async (req, res) => {
  try {
    const updatedata = {
      name: req.body.name,
      email: req.body.email,
      videos: req.body.videos,
      author: req.body.author,
      active: req.body.active,
    };
    const allData = await Playlist.updateOne(
      { _id: req.params.id },
      { $set: updatedata }
    );
    const updatedData = await Playlist.findOne({ _id: req.params.id });
    console.log("Data updated succesfully");
    res.status(200).json({
      status: 200,
      message: "User data updated successfully",
      userdata: updatedData,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
});

//Delete by Id
app.delete("/deletedata/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userPresent = await Playlist.findById(id);
    console.log(userPresent);
    if (!userPresent) {
      return res.status(404).json({
        status: "404",
        message: "User does not exist",
      });
    } else {
      // await Playlist.findByIdAndDelete(id);
      //instead of deleting user permanently we can deactivate the user account so that later it can be retrieved(This is industry practice)
      let updateUserAccStatus = {
        isDelete: "yes",
      };
      await Playlist.updateOne({ _id: id }, { $set: updateUserAccStatus });
    }

    res.status(200).json({
      status: "200",
      message: "User deleted Successfully",
      userdata: userPresent,
    });
  } catch (err) {
    res.status(500).json({
      status: "500",
      error: err,
    });
    console.log(err);
  }
});

//auto email sending in every 15 seconds
// cron.schedule("*/15 * * * * *", () => {
//   console.log("sending email every fifteen seconds");
//   let mailTransporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     from_name: "mail test",
//     auth: {
//       user: process.env.user,
//       pass: process.env.pass,
//     },
//     tls: {
//       rejectUnauthorized: false, // Allow self-signed certificates
//     },
//   });
//   let mailDetails = {
//     // from: 'souvickjash0011@gmail.com',
//     from: "morekilometersmorefun@gmail.com",
//     to: "imankalyanh@gmail.com",
//     subject: "Test mail",
//     text: "Mail Done",
//     html: `<html><body>email sent</body></html>`,
//   };
//   mailTransporter.sendMail(mailDetails, (err) => {
//     if (err) {
//       console.log("Oops , couldn't send the mail!", err);
//     } else {
//       console.log("Email sent successfully");
//     }
//   });
// });

app.listen(port, hostname, () => {
  console.log(`Server listening on http://${port}/`);
});
