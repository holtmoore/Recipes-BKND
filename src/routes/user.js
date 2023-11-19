// src/routes/user.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
import { UserModel } from "../models/Users.js";

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await UserModel.findOne({ username });
  if (user) {
    return res.status(400).json({ message: "Username already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new UserModel({ username, email, password: hashedPassword });
  await newUser.save();
  res.json({ message: "User registered successfully" });
});

router.get("/user/:userid", async (req, res) => {
    const { userID } = req.query;
    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    });

    router.put("/user", async (req, res) => {
        const { userID, recipeID } = req.body;
        const user = await UserModel.findById(userID);
        const savedRecipes = user.savedRecipes;
        if (savedRecipes.includes(recipeID)) {
            const index = savedRecipes.indexOf(recipeID);
            savedRecipes.splice(index, 1);
        } else {
            savedRecipes.push(recipeID);
        }
        await UserModel.findByIdAndUpdate(userID, { savedRecipes });
        res.json({ savedRecipes });
    }
);

router.put("/update-user/:userId", async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body; // Contains fields to be updated
  
    if (updateData.password) {
      // Hash the new password if it's being updated
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
  
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Error updating user", error: err });
    }
  });
  


router.delete("/delete-user/:userId", async (req, res) => {
    const { userId } = req.params;
  
    try {
      await UserModel.findByIdAndDelete(userId);
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting user", error: err });
    }
  });
  



router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Username or password is incorrect" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ message: "Username or password is incorrect" });
  }
  const token = jwt.sign({ id: user._id }, "secret");
  res.json({ token, userID: user._id });
});

export { router as userRouter };

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(req);
  if (authHeader) {
    jwt.verify(authHeader, "secret", (err) => {
      if (err) {
        return res.sendStatus(403);
      }
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
