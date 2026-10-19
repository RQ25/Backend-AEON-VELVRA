import express from "express";
import cors from "cors";
import path from "path";
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import MenuRoute from "./routers/menuRoutes";
import UserRoutes from "./routers/userRoutes";
import OrderRoute from './routers/orderRoute';

const PORT: number = 8000;
const app = express();

app.use(cors());
app.use(express.json());

// 🟢 PERBAIKAN 1: Tambahkan DUA prefix sekaligus (/menu-picture DAN /menu_picture)
// Agar baik penamaan pakai dash (-) maupun underscore (_) di URL tetap bisa mengakses folder fisik menu_picture
app.use("/menu-picture", express.static(path.join(process.cwd(), "public", "menu_picture")));
app.use("/menu_picture", express.static(path.join(process.cwd(), "public", "menu_picture")));

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Ordering System API',
      version: '1.0.0',
      description: 'API documentation for the ordering system',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routers/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/user", UserRoutes);
app.use(`/menu`, MenuRoute);
app.use(`/order`, OrderRoute);

// 🟢 PERBAIKAN 2: Akses fallback folder public bawaan
app.use(express.static(path.join(process.cwd(), "public")));

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});