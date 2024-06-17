import mongoose from 'mongoose';

let isConnected = false;
const MONGODB_URI = 'mongodb+srv://DevUmss:DevUmss@tss.auo4axl.mongodb.net/finanzas?retryWrites=true&w=majority&appName=tss';

const connectDB = async () => {
  if (isConnected) {
    console.log('Conexión a la base de datos ya establecida');
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = !!db.connections[0].readyState;
    console.log('Conexión a la base de datos establecida');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw new Error('Error de conexión a la base de datos');
  }
};

export default connectDB;
