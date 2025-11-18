import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const correo = (body.correo || "").trim();
    const oldPassword = body.oldPassword || "";
    const newPassword = body.newPassword || "";

    if (!correo || !oldPassword || !newPassword) {
      return NextResponse.json({ message: "Faltan campos" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { correo } });
    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const match = await bcrypt.compare(oldPassword, usuario.contraseña || "");
    if (!match) {
      return NextResponse.json({ message: "Contraseña actual incorrecta" }, { status: 401 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({ where: { correo }, data: { contraseña: hashed } });

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error en changePassword:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
