
import app from "./app.js";
import { sequelize } from "./models/model.js";


const PORT = process.env.PORT || 3000;

(async () => {
  try {
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database synced (development mode)");

      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT} [${process.env.NODE_ENV}]`);
      });
    }else {
      await sequelize.authenticate();
      console.log("Database connected successfully");

      app.listen(() => {
        console.log(`Server running at [${process.env.NODE_ENV}]`);
      });
    }
  } catch (err) {
    console.error("DB connection error:", err);
  }
})();
