import { Request, response, Response } from "express";
import { PrismaClient, Status} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL, SECRET } from "../global";
import fs from "fs"
import md5 from "md5"; /**enkripsi password */
import { sign } from "jsonwebtoken" /**menambahkan token */

const prisma = new PrismaClient({errorFormat: "pretty"})

export const getAllUser = async (request: Request, response: Response) => {
    try {
        const {search} = request.query
        const allUser = await prisma.user.findMany({
            where : {name: {contains: search?.toString()||""}}
        })
        return response.json({
            status: true,
            data: allUser,
            message: "User berhasil ditampilkan",
        }).status(200)
    }catch (error) {
        return response.json({
            status: false,
            message: `Mohon maaf terjadi kesalahan. ${error}`,
        }).status(400)
    }
}

export const createUser = async (request: Request, response: Response) => {
    try {
        /** get requested data (data has been sent from request) */
        const { name, email, password, role } = request.body;
        const uuid = uuidv4();

        /** variable filename use to define of uploaded file name */
        let filename = "";
        if (request.file) filename = request.file.filename; /** get file name of uploaded file */

        /** process to save new user */
        const newUser = await prisma.user.create({
            data: { uuid, name, email, password: md5(password), role, profile_picture: filename }
        });

        return response.json({
            status: true,
            data: newUser,
            message: `New user has created`
        }).status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400);
    }
};

export const updateUser = async (request: Request, response: Response) => {
    try {
        /** get id of user's id that sent in parameter of URL */
        const { id } = request.params
        /** get requested data (data has been sent from request) */
        const { name, email, password, role } = request.body

        /** make sure that data is exists in database */
        const findUser = await prisma.user.findFirst({ where: { userId: Number(id) } })
        if (!findUser) return response
            .status(200)
            .json({ status: false, message: `user is not found` })

        /** default value filename of saved data */
        let filename = findUser.profile_picture
        if (request.file) {
            /** update filename by new uploaded picture */
            filename = request.file.filename
            /** check the old picture in the folder */
            let path = `${BASE_URL}/../public/profile_picture/${findUser.profile_picture}`
            let exists = fs.existsSync(path)
            /** delete the old exists picture if reupload new file */
            if(exists && findUser.profile_picture !== ``) fs.unlinkSync(path)
        }

        /** process to update user's data */
        const updatedUser = await prisma.user.update({
            data: {
                name: name || findUser.name,
                email: email || findUser.email,
                password: password ? md5(password) : findUser.password,
                role: role || findUser.role,
                profile_picture: filename
            },
            where: { userId: Number(id) }
        })

        return response.json({
            status: true,
            data: updatedUser,
            message: `user has updated`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}


export const changePictureUser = async ( request: Request, response: Response ) => {
    try{
        const { id } = request.params

        const findUser = await prisma.user.findFirst({ where: { userId: Number(id) } })
        if (!findUser) return response
            .status(200)
            .json({ status: false, message: "User is not found"})
    
        // default value filename of saved data
        let filename = findUser.profile_picture
        if (request.file) {
            // update filename by uploaded picture
            filename = request.file.filename
            // check the old picture in the folder
            let path = `${BASE_URL}/../public/profile_picture/${findUser.profile_picture}`
            let exists = fs.existsSync(path)
            // delete the old picture if the picture exist
            if(exists && findUser.profile_picture !== ``) fs.unlinkSync(path)
        }

        /** proces to update picture in database */
        const upadtePicture = await  prisma.user.update({
            data: { profile_picture: filename },
            where: { userId: Number(id) },
        })

        return response.json({
            status: true,
            data: upadtePicture,
            message: "Picture has changed",
        }).status(200)
    } catch (error){
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)

    }
}

export const deleteUser = async (request : Request, response : Response) => {
    try{
        const { id } = request.params

        const findUser = await prisma.user.findFirst({ where : { userId: Number(id) } })
        if (!findUser) return response
            .status(200)
            .json({ status: false, message: "User is not found"})

        const deleteUser = await prisma.user.delete({
            where: { userId: Number(id)}
        })
        return response.json({
            status: true,
            data: deleteUser,
            message: "User has deleted",
        }).status(200)
    }catch(error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`,
            })
            .status(400)
    }
}

// authentication = login
// authorization = izin hak akses
// FIX AUTHENTICATION (Bisa membaca password Plaintext maupun MD5 Hash)
export const authentication = async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body;

        // 1. Cari user berdasarkan email saja
        const findUser = await prisma.user.findFirst({
            where: { email },
        });

        if (!findUser) {
            return response.status(200).json({
                status: false,
                logged: false,
                message: "Email or password is invalid",
            });
        }

        // 2. Cek apakah password cocok dengan Plaintext ATAU MD5 Hash
        const isPlaintextMatch = findUser.password === password;
        const isMd5Match = findUser.password === md5(password);

        if (!isPlaintextMatch && !isMd5Match) {
            return response.status(200).json({
                status: false,
                logged: false,
                message: "Email or password is invalid",
            });
        }

        const data = {
            id: findUser.userId,
            name: findUser.name,
            email: findUser.email,
            role: findUser.role,
        };

        const playpod = JSON.stringify(data);
        const token = sign(playpod, SECRET || "token");

        return response.status(200).json({
            status: true,
            logged: true,
            message: "login success",
            token,
            data
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error. ${error}`
        });
    }
};