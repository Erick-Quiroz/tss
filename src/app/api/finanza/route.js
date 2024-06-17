import connectDB from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Finanza from '@/models/Finanza';

// Función POST para crear un nuevo documento dinámico
export const POST = async (req) => {
  await connectDB();

  try {
    const body = await req.json();

    const newDocument = await Finanza.create(body);

    if (!newDocument) {
      console.error('Error al crear el documento en la base de datos');
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }

    return NextResponse.json({ data: newDocument }, { status: 201 });
  } catch (error) {
    console.error('Error al intentar crear un nuevo documento dinámico:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
};

export const GET = async () => {
  await connectDB();

  try {
    const result = await Finanza.find({});
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los documentos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
};

// Función DELETE para borrar todos los documentos de la colección Finanza
export const DELETE = async () => {
  await connectDB();

  try {
    const result = await Finanza.deleteMany({});
    
    if (result.deletedCount === 0) {
      console.warn('No se encontraron documentos para eliminar');
      return NextResponse.json({ message: 'No se encontraron documentos para eliminar' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Todos los documentos fueron eliminados exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar los documentos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
};
