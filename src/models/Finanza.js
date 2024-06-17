import mongoose from 'mongoose';

// Define el esquema flexible para los datos financieros
const FinanzasSchema = new mongoose.Schema({}, { strict: false });

// Crea el modelo a partir del esquema
const Finanza = mongoose.models.Finanza || mongoose.model('Finanza', FinanzasSchema);

export default Finanza;