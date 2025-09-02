// import { createServer } from "node:http";
// import next from "next";
// import { Server } from "socket.io";
// import cors from "cors";

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handler = app.getRequestHandler();

// app.prepare().then(() => {
//   const httpServer = createServer(handler);

//   const io = new Server(httpServer, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"]
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("connected");
//     socket.on("disconnect", () => {
//       console.log("disconnected");
//     });
//   });

//   const PORT = process.env.PORT || 3000;

//   httpServer
//     .once("error", (err) => {
//       console.error(err);
//       process.exit(1);
//     })
//     .listen(PORT, () => {
//       console.log(`> Ready on http://localhost:${PORT}`);
//     });
// });
