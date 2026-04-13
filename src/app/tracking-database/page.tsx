"use client";

import Sidebar from "@/components/sidebar/sidebar";
import { Filter, ChevronUp, Calendar, CalendarDays, Package, Tag, Building2, Map, MapPin, Users } from "lucide-react";
import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";

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
        <div className="min-h-screen bg-blue-50">
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-6 h-screen overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                        <div className="flex flex-col">
                            <h4 className="text-[20px] mb-1 font-extrabold text-(--gray-800) m-0 tracking-[-0.5px]">Database Tracking</h4>
                            <p className="text-sm ml-1 text-slate-500 font-medium">Monitor dan kelola seluruh data entitas dengan filter cerdas</p>
                        </div>
                    </div>

                    {/* Section Filter Data Cerdas */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header Biru Filter */}
                        <div className="bg-[#1a73e8] text-white px-6 h-10 flex items-center justify-between">
                            <div className="flex items-center">
                                <Filter size={12} className="mr-2" strokeWidth={2.5} />
                                <strong className="text-[8px] font-bold tracking-wide">Filter Data Cerdas</strong>
                                <span className="text-[8px] ml-2 text-blue-100 font-normal tracking-wide">(Multi-pilih, cascading dinamis)</span>
                            </div>
                            <button className="bg-white text-blue-600 p-1 rounded hover:bg-slate-50 transition-colors shadow-sm">
                                <ChevronUp size={16} strokeWidth={2.5} onClick={() => setIsFilterOpen(!isFilterOpen)} />
                            </button>
                        </div>

                        {/* Konten Filter */}
                        <div className="p-4 flex flex-col gap-3" style={{ display: isFilterOpen ? "flex" : "none" }}>
                            {/* Baris 1: Filter Tanggal Input */}
                            <div className="border border-slate-200 rounded-lg p-2 flex flex-col sm:flex-row items-start sm:items-center bg-white shadow-sm max-w-full">
                                <div className="flex items-center text-xs font-semibold text-gray-600 min-w-max mr-3 px-1 sm:mb-0 mb-2">
                                    <Calendar size={14} className="mr-2 text-blue-500" strokeWidth={2.5} />
                                    Tanggal Input:
                                </div>
                                <div className="flex items-center gap-2">
                                    <DatePicker className="w-40 text-xs h-8 shadow-none" placeholder="mm/dd/yyyy" />
                                    <span className="text-gray-400 font-semibold">-</span>
                                    <DatePicker className="w-40 text-xs h-8 shadow-none" placeholder="mm/dd/yyyy" />
                                </div>
                            </div>

                            {/* Baris 2: Tombol Filter (Bulan, Produk, Merek, dll) */}
                            <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full mt-1">
                                {filterButtons.map((btn, idx) => {
                                    const IconComponent = btn.icon;
                                    return (
                                        <button
                                            key={idx}
                                            className="flex flex-1 items-center justify-center gap-1.5 py-[7px] px-2 text-xs font-semibold border-[1.5px] border-[#ced4da] rounded-lg bg-white cursor-pointer text-[#495057] transition-all duration-150 select-none box-border truncate hover:bg-slate-50 hover:border-slate-400 min-w-[120px]"
                                        >
                                            <IconComponent size={10} className="text-slate-500 shrink-0" strokeWidth={2} />
                                            <span className="truncate">{btn.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header Biru Filter */}
                        <div className="bg-[#1E3B62] text-white px-6 h-10 flex items-center justify-between">
                            <div className="flex items-center">
                                <Filter size={12} className="mr-2" strokeWidth={2.5} />
                                <strong className="text-[8px] font-bold tracking-wide">Analis Data Tracking</strong>
                                <span className="text-[8px] ml-2 text-blue-100 font-normal tracking-wide">(Klik baris tabel analisa untuk filter data)</span>
                            </div>
                            <button className="bg-white text-blue-600 p-1 rounded hover:bg-slate-50 transition-colors shadow-sm">
                                <ChevronUp size={16} strokeWidth={2.5} onClick={() => setIsFilterOpen2(!isFilterOpen2)} />
                            </button>
                        </div>

                        {/* Konten Filter */}
                        <div className="p-4 flex flex-col gap-3" style={{ display: isFilterOpen2 ? "flex" : "none" }}>
                            {/* Baris 1: Filter Tanggal Input */}
                           <div className="col-md-6">
                            <div className="card border-0 h-100" style="border-left:4px solid #2563eb!important;background:#f8fbff;">
                                <div className="card-body py-2 px-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                                style="width:36px;height:36px;background:linear-gradient(135deg,#2563eb,#1e40af);flex-shrink:0;">
                                                <i className="bi bi-people-fill" style="font-size:14px;"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold" style="font-size:12px;color:#1e293b;">Total Data Unik</div>
                                                <div className="text-muted" style="font-size:10px;">No HP + Nama Entitas (kol. T &amp; E)</div>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-bold text-primary" id="statTotalUnik" style="font-size:1.8rem;line-height:1;">—</div>
                                            <div className="text-muted" style="font-size:10px;">kontak unik</div>
                                        </div>
                                    </div>
                                    <div class="progress mt-2" style="height:3px;"><div class="progress-bar bg-primary" style="width:100%"></div></div>
                                </div>
                            </div>
                        </div>

                        {/* Baris 2: Tombol Filter (Bulan, Produk, Merek, dll) */}
                        <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full mt-1">

                        </div>
                </div>
            </section>
        </div>
            </div >
        </div >
    );
}