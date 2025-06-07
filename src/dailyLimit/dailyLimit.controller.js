import DailyLimit from  './dailyLimit.model.js';
import Account from '../accounts/account.model.js';
import mongoose from 'mongoose';

export const createDailyLimit = async (req, res) => {
    try{
        const { accountId, amount } = req.body;

    // Validación básica
    if (!accountId || !amount) {
      return res.status(400).json({ message: 'accountId y amount son requeridos.' });
    }

    const monto = parseFloat(amount);
    const LIMITE_DIARIO = 10000;

    if (isNaN(monto) || monto <= 0) {
      return res.status(400).json({ message: 'El monto debe ser un número válido mayor a 0.' });
    }

    // ✅ Verificar que la cuenta existe y está activa
    const cuenta = await Account.findById(accountId);

    if (!cuenta) {
      return res.status(404).json({ message: 'Cuenta no encontrada.' });
    }

    if (!cuenta.status) {
      return res.status(403).json({ message: 'Cuenta inactiva. No se puede registrar transferencias.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar límite actual
    let registro = await DailyLimit.findOne({ accountId, date: today });

    if (!registro) {
      // Primera transferencia del día
      if (monto > LIMITE_DIARIO) {
        return res.status(403).json({ message: 'Límite diario excedido. Máximo permitido: Q10,000.' });
      }

      await DailyLimit.create({
        accountId,
        date: today,
        amountTransferredToday: mongoose.Types.Decimal128.fromString(monto.toString())
      });

      return res.status(201).json({
        status: 'creado',
        message: 'Transferencia registrada. Límite diario actualizado.',
        restante: LIMITE_DIARIO - monto
      });
    }

    // Registro ya existe
    const actual = parseFloat(registro.amountTransferredToday.toString());
    const nuevoTotal = actual + monto;

    if (nuevoTotal > LIMITE_DIARIO) {
      return res.status(403).json({
        message: 'Límite diario excedido. Ya alcanzaste el máximo de Q10,000.',
        actual,
        intento: monto,
        totalIntentado: nuevoTotal
      });
    }

    registro.amountTransferredToday = mongoose.Types.Decimal128.fromString(nuevoTotal.toString());
    await registro.save();

    return res.status(200).json({
      status: 'actualizado',
      message: 'Límite diario actualizado.',
      restante: LIMITE_DIARIO - nuevoTotal
    });
    }catch(error){
        res.status(500).json({
            success: false,
            msg: 'Error creating daily limit',
            error: error.message
        })
    }
}