import { Router } from "express";
import {
  getUsuarios,
  getUsuario,
  postUsuarios,
  putUsuario,
  deleteUsuario,
} from "../controllers/usuarios.controllers";

const router = Router();

router.get("/", getUsuarios);
router.get("/:id", getUsuario);
router.post("/", postUsuarios);
router.put("/:id", putUsuario);
router.delete("/:id", deleteUsuario);

export default router;
