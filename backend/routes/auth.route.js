// routes/authRoutes.js
import express from "express";
import { signup, signin, getMe} from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
// router.post("/signout", protect, signout);
// router.post("/refresh", refreshAccessToken);
router.get("/me", protectRoute, getMe);

export default router;