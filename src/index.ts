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

// 🟢 KONFIGURASI CORS DIPERBAIKI (IZINKAN DOMAIN VERCEL)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aeonvelvra.vercel.app',
    'https://frontend-aeon-velvra.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 🟢 static folder
app.use("/menu-picture", express.static(path.join(process.cwd(), "public", "menu_picture")));
app.use("/menu_picture", express.static(path.join(process.cwd(), "public", "menu_picture")));
app.use("/profile-picture", express.static(path.join(process.cwd(), "public", "profile_picture")));
app.use("/profile_picture", express.static(path.join(process.cwd(), "public", "profile_picture")));

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

app.use(express.static(path.join(process.cwd(), "public")));

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});