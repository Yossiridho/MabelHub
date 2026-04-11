"use client";


import SearchableSelect from "@/components/ui/SearchableSelect";
import { useState } from "react";
import { useSession } from "@/components/session/SessionProvider";

type TeamMember = {
    userId: string;
    fullName: string;
    username: string;
    role: string;
};

function displayName(m: {
    fullName?: string;
    username?: string;
    userId: string;
    role?: string;
}) {
    const name =
        (m.fullName || "").trim() || (m.username || "").trim() || m.userId;
    return m.role ? `${name} • ${m.role}` : name;
}

export default function InputDatabasePage() {
    const [provinsi, setProvinsi] = useState("");
    const [namaPerusahaan, setNamaPerusahaan] = useState("");
    const { user, loading: sessionLoading } = useSession();
    const canPickAssignee =
        user?.role === "LEADER" ||
        user?.role === "SUPERADMIN" ||
        user?.role === "ADMIN";

    const [assigneeOptions, setAssigneeOptions] = useState<TeamMember[]>([]);
    const [assignedToUserId, setAssignedToUserId] = useState("");
    const [requestor, setRequestor] = useState("");
    const [segmen, setSegmen] = useState<string>("");
    const [deadline, setDeadline] = useState<string>("");
    const [lokasi, setLokasi] = useState("");
    const [catatanHeader, setCatatanHeader] = useState("");

    return (
        <div className="min-h-screen bg-blue-50">
            <div className="flex">
                

                <div className="flex-1 p-6 ">
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-3xl pl-4 font-extrabold text-black drop-shadow-sm">
                                Database System
                            </h1>
                            <div className="text-sm ml-4 mt-2 text-slate-500 font-medium">
                                Form Input/Revisi Database
                            </div>
                        </div>
                    </div>
                    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                                <label className='text-sm font-semibold text-blue-600'>
                                    PENGINPUT
                                </label>

                                <div className="relative mt-2">
                                    {canPickAssignee ? (
                                        <SearchableSelect
                                            value={assignedToUserId}
                                            onChange={(val: string) => setAssignedToUserId(val)}
                                            options={[
                                                { value: "", label: "(Diri sendiri)" },
                                                ...assigneeOptions.map((m) => ({
                                                    value: m.userId,
                                                    label: displayName(m),
                                                })),
                                            ]}
                                            className="border-0 bg-white"
                                            placeholder="Pilih Assignee..."
                                        />
                                    ) : (
                                        // SALES: requestor tampil auto (boleh edit manual kalau mau)
                                        <input
                                            value={requestor}
                                            onChange={(e) => setRequestor(e.target.value)}
                                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                            placeholder="Nama requestor"
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className='text-sm font-semibold text-blue-600'>
                                    JENIS ENTITAS
                                </label>
                                <div className='relative mt-2'>
                                    <SearchableSelect
                                        value={segmen}
                                        onChange={(val: string) => setSegmen(val)}
                                        options={[
                                            { value: "", label: "-- Pilih --" },
                                            { value: "PT", label: "PT" },
                                            { value: "CV", label: "CV" },
                                            { value: "BLUD", label: "BLUD" },
                                            { value: "Pendidikan", label: "Pendidikan" },
                                            { value: "RS", label: "RS" },
                                            { value: "BUMN", label: "BUMN" },
                                            { value: "Tidak Diketahui", label: "Tidak Diketahui" },
                                        ]}
                                        className="border-0 bg-white"
                                        placeholder="Pilih Jenis Entitas..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='text-sm font-semibold text-blue-600'>
                                    NAMA PERUSAHAAN
                                </label>
                                <input
                                    value={namaPerusahaan}
                                    onChange={(e) => setNamaPerusahaan(e.target.value)}
                                    className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                                />
                            </div>

                            <div>
                                <label className='text-sm font-semibold text-blue-600'>
                                    PROVINSI
                                </label>
                                <input
                                    value={provinsi}
                                    onChange={(e) => setProvinsi(e.target.value)}
                                    className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
