"use client";

import Sidebar from "@/components/sidebar/sidebar";

export default function TrackingDatabasePage() {
    const filterButtons = [
        { id: "Bulan", icon: CalendarDays, label: "Bulan" },
        { id: "Produk", icon: Package, label: "Produk" },
        { id: "Merek", icon: Tag, label: "Merek" },
        { id: "Perusahaan", icon: Building2, label: "Perusahaan" },
        { id: "Provinsi", icon: Map, label: "Provinsi" },
        { id: "Kota", icon: MapPin, label: "Kota/Kab" },
        { id: "Tipe", icon: Users, label: "Tipe Kontak" },
    ];

    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [isFilterOpen2, setIsFilterOpen2] = useState(true);

    return (
        <div>
            <Sidebar />
            <h1>Tracking Database</h1>
        </div>
            </div >
        </div >
    );
}
