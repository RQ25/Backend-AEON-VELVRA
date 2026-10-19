import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendOrderNotificationEmail } from "../services/emailServices";

const prisma = new PrismaClient();

// 1. Get All Orders
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

// 2. Create Order & Send Email
// 2. Create Order & Send Email
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer, table_number, payment_method } = req.body;

    // Cek semua kemungkinan nama field array dari frontend Next.js
    const orderList = 
      req.body.orderList || 
      req.body.order_list || 
      req.body.items || 
      req.body.cart || 
      req.body.detail_order || 
      [];

    if (!Array.isArray(orderList) || orderList.length === 0) {
      console.log("Payload yang diterima dari frontend:", req.body);
      return res.status(400).json({
        status: false,
        message: "Daftar pesanan (orderList) tidak boleh kosong!",
      });
    }

    // Hitung total harga pesanan
    let total_price = 0;
    for (const item of orderList) {
      const menuId = Number(item.menuId || item.menu_id || item.id);
      const menuItem: any = await prisma.menu.findFirst({
        where: { id: menuId } as any,
      });
      
      if (menuItem) {
        const qty = Number(item.quantity || item.qty || 1);
        total_price += Number(menuItem.price) * qty;
      }
    }

    // Simpan order ke database
    const newOrder = await prisma.order.create({
      data: {
        customer,
        table_number: String(table_number),
        payment_method,
        total_price,
        orderList: {
          create: orderList.map((item: any) => ({
            menuId: Number(item.menuId || item.menu_id || item.id),
            quantity: Number(item.quantity || item.qty || 1),
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

    // Kirim email notifikasi
    try {
      await sendOrderNotificationEmail(newOrder);
    } catch (emailErr) {
      console.error("⚠️ Gagal kirim email:", emailErr);
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

// 3. Update Status Order
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

// 4. Delete Order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);

    await prisma.orderList.deleteMany({
      where: { orderId: targetId } as any,
    });

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