import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendOrderNotificationEmail } from "../services/emailServices";


// 1. Inisialisasi prisma client
const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllOrders = async (request: Request, response: Response) => {
  try {
    const { search } = request.query;

    const allOrders = await prisma.order.findMany({
      where: {
        OR: [
          { customer: { contains: search?.toString() || "" } },
          { table_number: { contains: search?.toString() || "" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        orderList: {
          include: { menu: true }
        }
      }
    });

    return response.status(200).json({
      status: true,
      data: allOrders,
      message: "Order list has retrieved"
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`
    });
  }
};

export const createOrder = async (request: Request, response: Response) => {
  try {
    const { customer, table_number, payment_method, orderlists } = request.body;

    let total_price = 0;
    if (Array.isArray(orderlists)) {
      for (let index = 0; index < orderlists.length; index++) {
        const { menuId, quantity } = orderlists[index];
        const detailMenu = await prisma.menu.findFirst({
          where: { menuId: Number(menuId) }
        });

        if (!detailMenu) {
          return response.status(200).json({
            status: false,
            message: `Menu with id ${menuId} is not found`
          });
        }
        total_price += detailMenu.price * Number(quantity);
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        customer,
        table_number,
        total_price,
        payment_method: payment_method || "QRIS" // Proteksi agar payment_method tidak bernilai kosong ""
      }
    });

    if (Array.isArray(orderlists)) {
      for (let index = 0; index < orderlists.length; index++) {
        const { menuId, quantity, note } = orderlists[index];
        await prisma.orderList.create({
          data: {
            idOrder: newOrder.id,
            menuId: Number(menuId),
            quantity: Number(quantity),
            note: note || ""
          }
        });
      }
    }

    // Fetch ulang data order lengkap dengan relation orderList & menu untuk email
    const fullOrderData = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        orderList: {
          include: {
            menu: true
          }
        }
      }
    });

    if (fullOrderData) {
      sendOrderNotificationEmail(fullOrderData);
    }

    return response.status(200).json({
      status: true,
      data: newOrder,
      message: "New Order has created"
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`
    });
  }
};

export const deleteOrder = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    const findOrder = await prisma.order.findFirst({
      where: { id: Number(id) }
    });

    if (!findOrder) {
      return response.status(200).json({
        status: false,
        message: "Order is not found"
      });
    }

    await prisma.orderList.deleteMany({
      where: { idOrder: Number(id) }
    });

    const deletedOrder = await prisma.order.delete({
      where: { id: Number(id) }
    });

    return response.status(200).json({
      status: true,
      data: deletedOrder,
      message: "Order has deleted"
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`
    });
  }
};

export const updateStatusOrder = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { status } = request.body;

    const findOrder = await prisma.order.findFirst({
      where: { id: Number(id) }
    });

    if (!findOrder) {
      return response.status(200).json({
        status: false,
        message: "Order is not found"
      });
    }

    const updatedStatus = await prisma.order.update({
      data: {
        status: status || findOrder.status
      },
      where: { id: Number(id) }
    });

    return response.status(200).json({
      status: true,
      data: updatedStatus,
      message: "Order has updated"
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`
    });
  }
};