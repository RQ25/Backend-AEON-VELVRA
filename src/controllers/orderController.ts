import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendOrderNotificationEmail } from "../services/emailServices";

const prisma = new PrismaClient();

// Get All Orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderList: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      status: true,
      data: orders,
      message: "Berhasil mengambil data pesanan",
    });
  } catch (error: any) {
    console.error("Error getAllOrders:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Create Order & Send Email
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer, table_number, payment_method, orderList } = req.body;

    // 1. Hitung total harga pesanan
    let total_price = 0;
    if (Array.isArray(orderList)) {
      for (const item of orderList) {
        // Ambil data menu menggunakan id bertipe any agar lolos dari pengecekan typescript strict
        const menuItem: any = await prisma.menu.findFirst({
          where: {
            id: Number(item.menuId),
          } as any,
        });

        if (menuItem) {
          total_price += Number(menuItem.price) * Number(item.quantity);
        }
      }
    }

    // 2. Simpan order ke database
    const newOrder = await prisma.order.create({
      data: {
        customer,
        table_number,
        payment_method,
        total_price,
        orderList: {
          create: orderList.map((item: any) => ({
            menuId: Number(item.menuId),
            quantity: Number(item.quantity),
            note: item.note || "",
          })),
        },
      },
      include: {
        orderList: {
          include: {
            menu: true,
          },
        },
      },
    });

    // 3. Kirim email notifikasi
    try {
      await sendOrderNotificationEmail(newOrder);
    } catch (emailErr) {
      console.error("⚠️ Email gagal dikirim, tetapi order tetap tersimpan:", emailErr);
    }

    return res.status(201).json({
      status: true,
      message: "Pesanan berhasil dibuat",
      data: newOrder,
    });
  } catch (error: any) {
    console.error("Error createOrder:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Update Status Order
export const updateStatusOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res.status(200).json({
      status: true,
      message: "Status pesanan berhasil diperbarui",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updateStatusOrder:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Delete Order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);

    // Hapus rincian orderList terlebih dahulu
    await prisma.orderList.deleteMany({
      where: {
        orderId: targetId,
      } as any,
    });

    // Hapus order utama
    await prisma.order.delete({
      where: { id: targetId },
    });

    return res.status(200).json({
      status: true,
      message: "Pesanan berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleteOrder:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};