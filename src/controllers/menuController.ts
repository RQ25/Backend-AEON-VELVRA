import { Request, Response } from "express";
import { $Enums, PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { BASE_URL } from "../global";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllMenus = async (request: Request, response: Response) => {
  try {
    const { search } = request.query;
    const allMenus = await prisma.menu.findMany({
      where: { name: { contains: search?.toString() || "" } },
    });
    return response
      .json({
        status: true,
        data: allMenus,
        message: "Menu bar retrieved",
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400);
  }
};

export const createMenu = async (request: Request, response: Response) => {
  try {
    const { name, price, category, description } = request.body;
    const uuid = uuidv4();

    let filename = ""
    if (request.file) filename = request.file.filename

    const newMenu = await prisma.menu.create({
      data: {
        uuid,
        name,
        price: parseInt(price),
        category: category.toUpperCase(),
        description,
        picture: filename
      },
    });
    return response
      .json({
        status: true,
        data: newMenu,
        message: "Menu created successfully",
      })
      .status(201);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `Error creating menu. ${error}`,
      })
      .status(400);
  }
};

export const updateMenu = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { name, price, category, description } = request.body;

    const findMenu = await prisma.menu.findFirst({
      where: { menuId: parseInt(id) },
    });
    if (!findMenu) {
      return response.status(404).json({
        status: false,
        message: "Menu not found",
      });
    }

    let filename = findMenu.picture;
    if (request.file) {
      filename = request.file.filename;
      const path = `${BASE_URL}/../public/menu_picture/${findMenu.picture}`;
      const exists = fs.existsSync(path);
      if (exists && findMenu.picture !== "") fs.unlinkSync(path);
    }

    const updateMenu = await prisma.menu.update({
      data: {
        name: name || findMenu.name,
        price: price ? parseInt(price) : findMenu.price,
        category: category || findMenu.category,
        description: description || findMenu.description,
        picture: filename,
      },
      where: { menuId: parseInt(id) },
    });

    return response
      .json({
        status: true,
        data: updateMenu,
        message: "Menu updated successfully",
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `Error updating menu. ${error}`,
      })
      .status(400);
  }
};

export const changePicture = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    const findMenu = await prisma.menu.findFirst({
      where: { menuId: parseInt(id) },
    });
    if (!findMenu) {
      return response.status(404).json({
        status: false,
        message: "Menu not found",
      });
    }

    let filename = findMenu.picture;
    if (request.file) {
      filename = request.file.filename;
      const path = `${BASE_URL}/../public/menu_picture/${findMenu.picture}`;
      const exists = fs.existsSync(path);
      if (exists && findMenu.picture !== "") fs.unlinkSync(path);
    }

    const updatePicture = await prisma.menu.update({
      data: { picture: filename },
      where: { menuId: parseInt(id) },
    });

    return response
      .json({
        status: true,
        data: updatePicture,
        message: "Picture changed successfully",
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `Error changing picture. ${error}`,
      })
      .status(400);
  }
};

export const deleteMenu = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    // Temukan data menu berdasarkan id
    const findMenu = await prisma.menu.findFirst({
      where: { menuId: parseInt(id) },
    });
    if (!findMenu) {
      return response.status(404).json({
        status: false,
        message: "Menu not found",
      });
    }

    let path = `${BASE_URL}/../public/menu_picture/$(findMenu.picture)`
    let exist = fs.existsSync(path)
    if (exist && findMenu.picture !== ``) fs.unlinkSync(path)

    // Cek apakah menu memiliki gambar dan hapus file gambarnya
    if (findMenu.picture) {
      const path = `${BASE_URL}/../public/menu_picture/${findMenu.picture}`;
      const exists = fs.existsSync(path);
      if (exists) {
        fs.unlinkSync(path); // Hapus gambar dari folder
      }
    }

    // Hapus data menu dari database
    const deletedMenu = await prisma.menu.delete({
      where: { menuId: parseInt(id) },
    });

    return response
      .json({
        status: true,
        data: deletedMenu,
        message: "Menu and image deleted successfully",
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `Error deleting menu and image. ${error}`,
      })
      .status(400);
  }
};
