"use client";
import { useState } from "react";
import { ChevronUp, Filter, Calendar, Users, MapIcon, Phone, CheckCircle, Briefcase, PieChartIcon, PhoneCallIcon, TrendingUpIcon, User, CalendarCheckIcon, SearchXIcon, ChevronDown } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis, AreaChart, Area } from "recharts";

type DashboardStats = {
    totalVisits: number;
    visited: number;
    stayOffice: number;
    notVisited: number;
    salesCount: number;
    satkerCount: number;
    cityCount: number;
    ring: {
        ring1: number;
        ring2: number;
        ring3: number;
        ring4: number;
    };
    trend?: { date: string; count: number }[];
    topSales?: { name: string; count: number }[];
    klpd?: { name: string; count: number }[];
};

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];


export default function ReportProgresPage() {
    const filterButtons = [
        { id: 'pic_sales', icon: Users, label: 'PIC Sales' },
        { id: 'validitas', icon: CheckCircle, label: 'Validitas' },
        { id: 'provinsi', icon: MapIcon, label: 'Provinsi' },
        { id: 'status_wa', icon: Phone, label: 'Status WA' },
    ]
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<string[]>([])
    const [stats, setStats] = useState<DashboardStats | null>(null);

    const data = [
        { name: "Valid", value: 120 },
        { name: "Invalid", value: 40 },
        { name: "Not Yet", value: 60 },
    ];

    const dataStatusWa = [
        { name: "Diterima (2C)", value: 100 },
        { name: "Dibaca - Belum Respons", value: 40 },
        { name: "Dibaca - Respons Positif", value: 60 },
        { name: "Terkirim (1C)", value: 100 },
        { name: "Aktif Broadcast", value: 40 },
    ];

    const dataTren = [
        { name: "Jan", validasiSales: 170, reportWa: 90 },
        { name: "Feb", validasiSales: 40, reportWa: 60 },
        { name: "Mar", validasiSales: 60, reportWa: 75 },
        { name: "Apr", validasiSales: 100, reportWa: 80 },
        { name: "Mei", validasiSales: 40, reportWa: 55 },
        { name: "Jun", validasiSales: 80, reportWa: 70 },
        { name: "Jul", validasiSales: 30, reportWa: 50 },
        { name: "Agu", validasiSales: 70, reportWa: 65 },
        { name: "Sep", validasiSales: 120, reportWa: 85 },
        { name: "Okt", validasiSales: 40, reportWa: 55 },
        { name: "Nov", validasiSales: 60, reportWa: 70 },
        { name: "Des", validasiSales: 100, reportWa: 90 },
    ];

    const dataProvinsi = [
        { name: "DKI Jakarta", value: 195 },
        { name: "Jawa Barat", value: 40 },
        { name: "Jawa Tengah", value: 60 },
        { name: "Banten", value: 40 },
        { name: "Jawa Timur", value: 60 },
        { name: "Jawa Barat", value: 40 },
        { name: "Jawa Tengah", value: 60 },
        { name: "Banten", value: 40 },
        { name: "Jawa Timur", value: 60 },
        { name: "Jawa Barat", value: 40 },
        { name: "Jawa Tengah", value: 60 },
        { name: "Banten", value: 40 },
        { name: "Jawa Timur", value: 60 },
    ];



    return (
        <div className="min-h-screen bg-blue-50">
            <div className="flex">
                <div className="flex-1 p-6">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                        <div className="flex flex-col">
                            <h4 className="text-[16px] mb-1 font-extrabold  text-(--gray-800) m-0 tracking-[0-.5px]">
                                Report Progres
                            </h4>
                            <p className="text-sm ml-0.5 text-slate-500 font-bold">
                                Analisa & grafik dari VALIDASI_SALES dan REPORT_WA
                            </p>
                        </div>
                    </div>
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-500 text-white px-6 h-10 flex items-center justify-between">
                            <div className="flex items-center">
                                <Filter size={12} className="mr-2" strokeWidth={2.5} />
                                <strong className="text-[10px] font-extrabold tracking-widest">
                                    Filter Report
                                </strong>
                                <span className="text-[8px] ml-2 text-gray-200 font-normal tracking-wide">
                                    (Multi-pilih, cascading dinamis)
                                </span>
                            </div>
                            <button className="bg-white text-gray-400 p-1 rounded hover:bg-slate-50 transition-colors shadow-sm cursor-pointer" aria-label={isFilterOpen ? "Tutup filter" : "Buka filter"}>
                                <ChevronDown
                                    size={16}
                                    strokeWidth={2.5}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={isFilterOpen ? "rotate-180" : ""}

                                />
                            </button>
                        </div>
                        <div
                            className="p-4 flex flex-col gap-3"
                            style={{ display: isFilterOpen ? "flex" : "none" }}
                        >
                            <div className="flex items-center gap-3 justify-start">
                                <span className="text-md text-slate-500 items-center pl-1 h-10">Sumber:</span>
                                <button className="text-sm border rounded-lg mb-3 px-3 py-2 h-9 border-slate-300 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all duration-200 cursor-pointer whitespace-nowrap">
                                    Semua
                                </button>
                                <button className="text-sm border rounded-lg mb-3 px-3 py-2 h-9 border-slate-300 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all duration-200 cursor-pointer whitespace-nowrap">
                                    Validasi Sales
                                </button>
                                <button className="text-sm border rounded-lg mb-3 px-3 py-2 h-9 border-slate-300 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all duration-200 cursor-pointer whitespace-nowrap">
                                    Report WA
                                </button>
                            </div>
                            {/* Baris 1: Filter Tanggal Input */}
                            <div className="border border-slate-200 rounded-lg p-2 flex flex-col sm:flex-row items-start sm:items-center bg-white shadow-sm max-w-full ">
                                <div className="flex items-center text-xs font-semibold text-gray-600 min-w-max mr-3 px-1 sm:mb-0 mb-2">
                                    <Calendar
                                        size={14}
                                        className="mr-2 text-blue-500"
                                        strokeWidth={2.5}
                                    />
                                    Tanggal Input :
                                </div>
                                <div className="flex item-center gap-2">
                                    <input
                                        type="date"
                                        className="w-30 text-xs h-8 shadow-none border-1 border-slate-300 rounded-lg"
                                        placeholder="Dari"
                                        value={startDate}
                                        onChange={(e) => { setStartDate(e.target.value); setPage(1); setSelected(null); }}
                                    />
                                    <span className="text-gray-400 font-semibold">-</span>
                                    <input
                                        type="date"
                                        className="w-30 text-xs h-8 shadow-none border-1 border-slate-300 rounded-lg"
                                        placeholder="Sampai"
                                        value={endDate}
                                        onChange={(e) => { setEndDate(e.target.value); setPage(1); setSelected(null); }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full mt-1">
                                {filterButtons.map((btn, idx) => {
                                    const IconComponent = btn.icon
                                    return (
                                        <button
                                            key={idx}
                                            className="flex flex-1 items-center justify-center gap-1.5 py-[7px] px-2 text-xs font-semibold border-[1.5px] border-[#ced4da] rounded-lg bg-white cursor-pointer text-[#495057] transition-all duration-150 select-none box-border truncate hover:bg-slate-50 hover:border-slate-400 min-w-[120px]"
                                        >
                                            <IconComponent
                                                size={10}
                                                className="text-slate-500 shrink-0"
                                                strokeWidth={2}
                                            />
                                            <span className="truncate">{btn.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-4">
                        {/* Card 1: Total Laporan Sales */}
                        <div className="flex flex-row items-center gap-3 bg-blue-100 rounded-xl shadow-sm border border-gray-100 px-4 py-3 ">
                            <div className="rounded-full flex items-center justify-center text-white shrink-0 w-11 h-11 bg-blue-800">
                                <Briefcase size={18} strokeWidth={2} className="text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 truncate">
                                    Total Laporan Sales
                                </div>
                                <div className="text-[1.6rem] font-extrabold leading-tight text-blue-900">
                                    184
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                    entri di VALIDASI_SALES
                                </div>
                            </div>
                        </div>
                        {/* Card 2: Total Report WA */}
                        <div className="flex flex-row items-center gap-3 bg-green-100 rounded-xl shadow-sm border border-gray-100 px-4 py-3">
                            <div className="rounded-full flex items-center justify-center text-white shrink-0 w-11 h-11 bg-green-600">
                                <Phone size={18} strokeWidth={2} className="text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 truncate">
                                    Total Report WA
                                </div>
                                <div className="text-[1.6rem] font-extrabold leading-tight text-green-700">
                                    281
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                    entri di REPORT_WA
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Unik Perusahaan */}
                        <div className="flex flex-row items-center gap-3 bg-orange-100 rounded-xl shadow-sm border border-gray-100 px-4 py-3">
                            <div className="rounded-full flex items-center justify-center text-white shrink-0 w-11 h-11 bg-orange-500">
                                <Users size={18} strokeWidth={2} className="text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 truncate">
                                    Unik Perusahaan
                                </div>
                                <div className="text-[1.6rem] font-extrabold leading-tight text-orange-500">
                                    207
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                    perusahaan berbeda
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Aktif PIC Sales */}
                        <div className="flex flex-row items-center gap-3 bg-teal-100 rounded-xl shadow-sm border border-gray-100 px-4 py-3">
                            <div className="rounded-full flex items-center justify-center text-white shrink-0 w-11 h-11 bg-teal-600">
                                <CheckCircle size={18} strokeWidth={2} className="text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 truncate">
                                    Aktif PIC Sales
                                </div>
                                <div className="text-[1.6rem] font-extrabold leading-tight text-teal-700">
                                    3
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                    PIC Sales berkontribusi
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                        {/* Pie Chart: Distribusi Validitas */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b-2 bg-blue-100 border-blue-700">
                                <PieChartIcon size={12} strokeWidth={2} className="text-indigo-600" />
                                <p className="text-[11px] font-bold text-[#1e293b]">
                                    Distribusi Validitas
                                </p>
                            </div>
                            <div style={{ width: '100%', height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="40%"
                                            cy="50%"
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={90}
                                            innerRadius={45}
                                            paddingAngle={3}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number, name: string) => [value, name]}
                                        />
                                        <Legend
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: '11px' }}
                                            align="right"
                                            verticalAlign="middle"
                                            layout="vertical"
                                            height={20}
                                            width={100}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b-2 bg-green-100 border-green-700">
                                <PhoneCallIcon size={12} strokeWidth={2} className="text-green-600" />
                                <p className="text-[11px] font-bold text-[#1e293b]">
                                    Distribusi Status Wa
                                </p>
                            </div>
                            <div style={{ width: '100%', height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dataStatusWa}
                                        margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                                        layout="vertical"
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#E5E7EB"
                                        />
                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: "#6B7280" }}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fill: "#374151" }}
                                            width={135}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "none",
                                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                fontSize: "11px",
                                            }}
                                            formatter={(value: number) => [value, "Jumlah"]}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                                            {dataStatusWa.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 w-full mt-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-1.5 px-2 pt-3 pb-2 border-b-2 bg-blue-100 border-blue-700">
                                <TrendingUpIcon size={12} strokeWidth={2} className="text-blue-600" />
                                <p className="text-[11px] font-bold text-[#1e293b]">
                                    Tren Laporan per Bulan
                                </p>
                            </div>
                            <div style={{ width: '100%', height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={dataTren}
                                        margin={{ top: 16, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="gradValidasi" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="gradWa" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#E5E7EB"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: "#6B7280" }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: "#6B7280" }}
                                            width={30}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "1px solid #E5E7EB",
                                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                fontSize: "11px",
                                            }}
                                            formatter={(value: number, name: string) => [
                                                value,
                                                name === "validasiSales" ? "Validasi Sales" : "Report WA",
                                            ]}
                                        />
                                        <Legend
                                            verticalAlign="top"
                                            align="center"
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: "11px", paddingBottom: "4px" }}
                                            formatter={(value) =>
                                                value === "validasiSales" ? "Validasi Sales" : "Report WA"
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="validasiSales"
                                            stroke="#f97316"
                                            strokeWidth={2.5}
                                            fill="url(#gradValidasi)"
                                            fillOpacity={1}
                                            dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
                                            activeDot={{ r: 5, strokeWidth: 0 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="reportWa"
                                            stroke="#10b981"
                                            strokeWidth={2.5}
                                            fill="url(#gradWa)"
                                            fillOpacity={1}
                                            dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                                            activeDot={{ r: 5, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full h-[250px] mt-5">
                        <div className="flex flex-col rounded-lg border border-slate-100 overflow-hidden bg-slate-100 shadow-sm">
                            <div className="flex justify-between items-center gap-1.5 px-2 pt-3 pb-2 border-b-2 bg-orange-100 border-yellow-700">
                                <div className="flex items-center gap-1.5">
                                    <User size={12} strokeWidth={2} className="text-yellow-600" />
                                    <p className="text-[11px] font-bold text-[#1e293b]">
                                        Progress per PIC Sales
                                    </p>
                                </div>
                                <p className="text-xs px-2 py-0.5 rounded-full text-yellow-900">
                                    3 Pic Sales
                                </p>
                            </div>
                            <div className="flex flex-col overflow-hidden shadow-sm">
                                <table className="w-ful text-left border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th className="px-2 py-1.5 text-[10px] font-semibold text-slate-500">
                                                #
                                            </th>
                                            <th className="px-2 py-1.5 text-[10px] font-semibold text-slate-500">
                                                PIC Sales
                                            </th>
                                            <th className="px-2 py-1.5 text-[10px] font-semibold text-slate-500">
                                                Validasi Sales
                                            </th>
                                            <th className="px-2 py-1.5 text-[10px] font-semibold text-slate-500">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody
                                        id='tbodyPicSales'
                                        className='divide-y divide-gray-300'
                                    >
                                        {[
                                            {
                                                no: 1,
                                                pic: 'Arie Muhammad Fajar',
                                                unik: 50,
                                                progress: 80,
                                            },
                                            {
                                                no: 2,
                                                pic: 'Beffry',
                                                unik: 20,
                                                progress: 40,
                                            },
                                            {
                                                no: 3,
                                                pic: 'Ferrie',
                                                unik: 40,
                                                progress: 60,
                                            },
                                        ].map((row) => (
                                            <tr
                                                key={row.no}
                                                className='hover:bg-green-50/50 transition-colors cursor-pointer'
                                            >
                                                <td className='px-2 py-1.5 text-[10px] text-slate-900 font-bold'>
                                                    {row.no}
                                                </td>
                                                <td className='px-2 py-1.5 text-[10px] text-slate-900 font-medium'>
                                                    {row.pic}
                                                </td>

                                                <td className='px-2 py-1.5 text-[10px] text-slate-600'>
                                                    <div className='flex-1 min-w-[36px] bg-blue-100 rounded-full h-[4px] overflow-hidden'>
                                                        <div
                                                            className='bg-blue-600 h-full rounded-full'
                                                            style={{ width: `${row.unik}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1.5 text-[10px] text-slate-700 font-medium">
                                                    <div className='items-center inline-flex justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-700 text-white'>
                                                        {row.unik}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center gap-1.5 px-2 pt-3 pb-2 border-b-2 bg-blue-100 border-blue-700">
                            <MapIcon size={12} strokeWidth={2} className="text-blue-600" />
                            <p className="text-[11px] font-bold text-[#1e293b]">
                                Distribusi per Provinsi
                            </p>
                        </div>
                        <div style={{ width: '100%', height: 230 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={dataProvinsi}
                                    margin={{ top: 30, right: 16, left: 0, bottom: 30 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#E5E7EB"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 9,
                                            fill: "#374151",
                                            textAnchor: "end",
                                        }}
                                        angle={-30}
                                        interval={0}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: "#6B7280" }}
                                        width={28}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            fontSize: "11px",
                                        }}
                                        formatter={(value: number) => [value, "Jumlah"]}
                                    />
                                    <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={50}>
                                        {dataProvinsi.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 w-full gap-3 h-[350px] mt-5">
                    <div className="flex flex-col rounded-lg border border-white overflow-hidden bg-white-100 shadow-sm">
                        <div className="flex items-center gap-1.5 px-2 pt-3 pb-2 border-b-2 bg-white-100 border-blue-600">
                            <CalendarCheckIcon size={12} strokeWidth={2} className="text-blue-600" />
                            <p className="text-[11px] font-bold text-[#1e293b]">
                                Detail Data
                            </p>
                        </div>
                        <div className="overflow-y-auto max-h-[320px] shadow-sm" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                            <table className="border-collapse w-full">
                                <thead className='w-full text-left border-collapse sticky top-0 z-10 bg-white'>
                                    <tr>
                                        <th className="px-2 py-1.5 text-[10px] text-black font-bold border-b border-slate-200">
                                            No
                                        </th>
                                        <th className="px-2 py-1.5 text-[10px] text-black font-bold border-b border-slate-200">
                                            Tanggal
                                        </th>
                                        <th className="px-2 py-1.5 text-[10px] text-black font-bold border-b border-slate-200">
                                            PIC SALES
                                        </th>
                                        <th className="px-2 py-1.5 text-[10px] text-black font-bold border-b border-slate-200">
                                            Perusahaan
                                        </th>
                                        <th className="px-2 py-1.5 text-[10px] text-black font-bold border-b border-slate-200">
                                            Kota
                                        </th>
                                        <th className="px-2 py-1.5 text-[10px] text-black font-bold border-b border-slate-200">
                                            Provinsi
                                        </th>
                                        <th className="px-2 py-1.5 text-[10px] text-black font-bold border-b border-slate-200">
                                            Validitas
                                        </th>
                                        <th className="px-2 py-1.5 text-[10px] text-black font-bold border-b border-slate-200">
                                            Detail
                                        </th>
                                    </tr>
                                </thead>
                                <tbody
                                    id="tbodyDetailData"
                                    className="divide-y divide-gray-200 px-2 items-center bg-white">
                                    {Array(15).fill(0).map((_, index) => (
                                        <tr key={index}>
                                            <td className='py-1 px-2 items-center justify-between text-xs font-medium text-slate-900 border-b border-slate-200'>{index + 1}</td>
                                            <td className='py-1 px-2 text-xs font-medium text-slate-900 border-b border-slate-200'>01/02/2024</td>
                                            <td className='py-1 px-2 text-xs font-medium text-slate-900 border-b border-slate-200'>Budi</td>
                                            <td className='py-1 px-2 text-xs font-medium text-slate-900 border-b border-slate-200'>PT. Maju Mundur</td>
                                            <td className='py-1 px-2 text-xs font-medium text-slate-900 border-b border-slate-200'>Jakarta</td>
                                            <td className='py-1 px-2 text-xs font-medium text-slate-900 border-b border-slate-200'>Indonesia</td>
                                            <td className='py-1 px-2 text-xs font-medium text-slate-900 border-b border-slate-200'>
                                                <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-green-100 border border-green-200 rounded-full text-xs font-medium text-green-700">
                                                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                                    Valid
                                                </div>
                                            </td>
                                            <td className='py-1 px-2 text-xs font-medium text-slate-700 border-b border-slate-200'>
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                                                    <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                                                    View
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div >
    );
}   