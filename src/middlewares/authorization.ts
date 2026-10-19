import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { SECRET } from "../global";
import { error } from "console";

interface JwtPayLoad {
    id: string;
    name: string;
    email: string;
    role: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
        const secretkey = SECRET || ""
        const decoded = verify(token, secretkey);
        req.body.user = decoded as JwtPayLoad;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export const verifyRole = (allowedRoles: string[] ) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.body.user;

        if (!user) {
            return res.status(401).json({ message: 'No User Information' });
        }
        
        if (!allowedRoles.includes(user.role)) {
            return res.status(403)
            .json({ message: `Access Denied. Requires one od the following roles: ${allowedRoles.join(',')}`});
        }

        next();
    }
}

