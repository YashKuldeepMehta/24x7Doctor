import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { name, email, password, phone, role, village, district, language,
      // patient fields
      dob, gender, abhaId, bloodGroup, emergencyContact,
      // doctor fields
      specialization, registrationNumber, qualifications, experienceYears, consultationFee, availabilitySlots,
      // pharmacy admin
      pharmacyId, } =
    req.body;
  try {
    if (!email || !password || !name || !phone || !role)
      return res
        .status(400)
        .json({ success: false, message: "Fill all fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {name, phone, email, role,
      password: hashedPassword,
      village: village ? village : "",
       district: district ? district : "",
        language
    }

    if (role === "patient") {
      Object.assign(userData, { dob, gender, abhaId, bloodGroup, emergencyContact });

    } else if (role === "doctor") {
      Object.assign(userData, {
        specialization, registrationNumber,
        qualifications, experienceYears,
        consultationFee, availabilitySlots,
      });

    } else if (role === "pharmacy") {
      Object.assign(userData, { pharmacyId });

    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const newUser = await User.create(userData);

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated. Contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    user.lastSeen = new Date();
    if (user.role === "doctor") user.isOnline = true;
    await user.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.cookie("token", token, {
  httpOnly: true,
});

    return res.status(200).json({
      success: true,
      message: "Signed in successfully",
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getMe = async (req, res, next) =>{
    try {
        const user = req.user;
        if (!user) {
      return res.status(400).json({
        success: false,
        message: "Not authorized"
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "You are authorized my guy. Have fun!!"
    });
    } catch (error) {
        console.error("authorization error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
    
}