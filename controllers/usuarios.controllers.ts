import { Request, Response } from "express";
import Usuario from "../models/usuario";

export const getUsuarios = async (req: Request, res: Response) => {
  const usuarios = await Usuario.findAll();

  res.json(usuarios);
};

export const getUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;

  const usuario = await Usuario.findByPk(id);

  if (usuario) {
    res.json(usuario);
  } else {
    res.status(404).json({
      message: `No existe el usuario con el id ${id}`,
    });
  }
};

export const postUsuarios = async (req: Request, res: Response) => {
  const { body } = req;

  try {
    const existeEmail = await Usuario.findOne({
      where: {
        email: body.email,
      },
    });

    if (existeEmail) {
      return res.status(400).json({
        message: "El email que esta registrando ya esta en uso",
      });
    }

    const usuario = await Usuario.create({
      nombre: body.nombre,
      email: body.email,
      estado: body.estado,
    });

    await (await usuario).save();

    res.status(200).json({
      message: "El registro se agrego correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Por favor hable con el administrador",
    });
  }
};

export const putUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const usuario = await Usuario.findByPk(id);

    if (usuario) {
      await usuario.update(body);

      res.status(200).json({
        message: "El registro se actualizo correctamente",
      });
    } else {
      res.status(404).json({
        message: `No existe el usuario con el id ${id}`,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Por favor hable con el administrador",
    });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;

  const usuario = await Usuario.findByPk(id);

  if (usuario) {
    //await usuario.update({ estado: false });

    await usuario.destroy();

    res.status(200).json({
      message: "El registro se elimino correctamente",
    });
  } else {
    return res.status(404).json({
      message: `No existe el usuario con el id ${id}`,
    });
  }
};
