import {Schema, model, models} from 'mongoose';

const RequestSphSchema = new Schema(
    {
        id: { type: Number, index: true },
        user_id: { type: Number, index: true },
        nama_sales: { type: String, index: true },
        requestor: { type: String, index: true },
        pemohon: { type: String, index: true },
        segmen: { type: String, index: true },
        lokasi: { type: String, index: true },
        deadline: { type: Date, index: true },
        catatanHeader: { type: String, index: true },

    },
    { timestamps: true }
);

export const RequestSph = 
    models.RequestSph || model('RequestSph', RequestSphSchema, 'RequestSph');