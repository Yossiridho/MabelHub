import {Schema, model, models} from 'mongoose';

const RequestKontakSchema = new Schema(
    {
        id: {type: Number, index: true},
        user_id: {type: Number, index: true},
        nama: {type: String, index: true},
        noTelp: {type: String, index: true},
        jabatan: {type: String, index: true},
        tipeKontak: {type: String, index: true},
        email: {type: String, index: true},
        bidagPerusahaan: {type: String, index: true},
        segmentasi: {type: String, index: true},
        produkRelevan: {type: String, index: true},
        merekTayang: {type: String, index: true},
        brandOwner: {type: String, index: true},
        sumberData: {type: String, index: true},
        linkProduk: {type: String, index: true},
        linkToko: {type: String, index: true},
    },
    { timestamps: true}
);

export const RequestKontak = models.RequestKontak || model('RequestKontak', RequestKontakSchema, 'RequestKontak');
