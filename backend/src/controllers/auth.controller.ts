import { Request , Response } from 'express';

export function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        res.json({ message: "Login successful!" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export function signUp(req: Request, res: Response) {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Email, password, and name are required" });
        }
        res.json({ message: "Sign up successful!" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }   
}