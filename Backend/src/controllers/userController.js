import httpStatus from "http-status";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt"; // preferred
import { hash, compare } from "bcrypt";
import crypto from "crypto"
import { Meeting } from "../models/meetingModel.js";


const login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" })
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }


        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
    const { name, username, password } = req.body;


    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered" })

    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }

}


const getUserHistory = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const meetingCode = req.body.meeting_code;

        if (!meetingCode) {
            return res.status(400).json({ message: "Meeting code is required" });
        }

        const existingMeeting = await Meeting.findOne({
            user_id: user.username,
            meetingCode
        });

        if (existingMeeting) {
            return res.status(409).json({ message: "Meeting already exists in history" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` });
    }
};


export { login, register, getUserHistory, addToHistory }