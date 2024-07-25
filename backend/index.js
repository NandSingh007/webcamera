const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const SECRET_KEY = "your_secret_key"; // In a real application, use a more secure secret key

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://shubhamsrathore07:SsgfjBtQ0NqjKJum@cluster0.ypuxcdk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
  const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: [true, "Email is required"],
     
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  });
  
  const Users = mongoose.model("User", userSchema);
// Define Media schema and model
const mediaSchema = new mongoose.Schema({
  type: String,
  data: Buffer
});

const Media = mongoose.model("Media", mediaSchema);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({ origin: "http://localhost:3000" }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Registration route

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password )
  try {
    const user = new Users({ email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error); // Log the detailed error
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});


// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password, " login");
  try {
    const user = await Users.findOne({ email });
    // console.log(user, "user");
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1h"
    });
    console.log(token,"token")
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Middleware to authenticate token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Route to handle image upload
app.post("/upload-image", async (req, res) => {
  try {
    const imgBuffer = Buffer.from(req.body.image.split(",")[1], "base64");
    const newImage = new Media({ type: "image", data: imgBuffer });
    console.log(imgBuffer, newImage, "imgBuffer, newImage");
    await newImage.save();
    res.status(200).json({ message: "Image uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error });
  }
});

// Route to handle video upload
app.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    const newVideo = new Media({ type: "video", data: req.file.buffer });
    console.log(newVideo, "newVideo");
    await newVideo.save();
    res.status(200).json({ message: "Video uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading video", error });
  }
});

// Protected route example
app.get("/protected", auth, (req, res) => {
  res.status(200).json({ message: "Access granted", userId: req.user.userId });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
