"use client";

import { useState } from "react";
import { Users, DateCalendar, Building, MapPin, MapPinCheck, MapPinOff, Phone, Mail, X, Plus, Check, Clock, Filter } from 'lucide-react';

type KontakItems = {
    kode_input: string;
    nama_perusahaan: string;
    kota: string;
    provinsi: string;
    produk_relevan: string;
    nama: string;
    jabatan: string;
    no_telp: string;
    tipe_kontak: string;
    is_wa_send: string;
    is_wa_read: string;
    is_wa_replied: string;
}

export default function TindakLanjutSalesPage () {

    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [isFilterOpen2, setIsFilterOpen2] = useState(true);

    

}