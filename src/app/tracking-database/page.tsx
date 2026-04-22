'use client'

import {
  Filter,
  ChevronUp,
  Calendar,
  CalendarDays,
  Package,
  Tag,
  Building2,
  Map,
  MapPin,
  MapPinCheck,
  Users,
  PhoneCallIcon,
  BarChart2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import DatePicker from '@/components/ui/DatePicker'

type ApiResp = {
  kode: string
  nama_perusahaan: string
  kota: string
  provinsi: string
  produk: string
  pic: string
  jabatan: string
  telp: string
  tipe: string
}

export default function TrackingDatabasePage() {
  const filterButtons = [
    { id: 'Bulan', icon: CalendarDays, label: 'Bulan' },
    { id: 'Produk', icon: Package, label: 'Produk' },
    { id: 'Merek', icon: Tag, label: 'Merek' },
    { id: 'Perusahaan', icon: Building2, label: 'Perusahaan' },
    { id: 'Provinsi', icon: Map, label: 'Provinsi' },
    { id: 'Kota', icon: MapPin, label: 'Kota/Kab' },
    { id: 'Tipe', icon: Users, label: 'Tipe Kontak' },
  ]

  // filter state
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isFilterOpen2, setIsFilterOpen2] = useState(true)

  // filter value
  const [bulan, setBulan] = useState('ALL');
  const [produk, setProduk] = useState('ALL');
  const [merek, setMerek] = useState('ALL');
  const [perusahaan, setPerusahaan] = useState('ALL');
  const [provinsi, setProvinsi] = useState('ALL');
  const [kota, setKota] = useState('ALL');
  const [tipe, setTipe] = useState('ALL');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [kode_input, setKodeInput] = useState('');
  const datePart = kode_input.split('-')[1];

  // konversi ke format Date 
  const year = `20${datePart?.substring(0, 2)}`;
  const month = datePart?.substring(2, 4);
  const day = datePart?.substring(4, 6);
  const formattedDate = `${year}-${month}-${day}`;
  console.log(formattedDate)

  // data
  const [loading, setLoading] = useState(true)
  const [resp, setResp] = useState<ApiResp[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/api/tracking-database',
        )
        const data = await response.json()
        setResp(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className='min-h-screen bg-blue-50'>
      <div className='flex'>
        <div className='flex-1 p-6'>
          <div className='bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100'>
            <div className='flex flex-col'>
              <h4 className='text-[20px] mb-1 font-extrabold text-(--gray-800) m-0 tracking-[-0.5px]'>
                Database Tracking
              </h4>
              <p className='text-sm ml-1 text-slate-500 font-medium'>
                Monitor dan kelola seluruh data entitas dengan filter cerdas
              </p>
            </div>
          </div>

          {/* Section Filter Data Cerdas */}
          <section className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            {/* Header Biru Filter */}
            <div className='bg-[#1a73e8] text-white px-6 h-10 flex items-center justify-between'>
              <div className='flex items-center'>
                <Filter size={12} className='mr-2' strokeWidth={2.5} />
                <strong className='text-[8px] font-bold tracking-wide'>
                  Filter Data Cerdas
                </strong>
                <span className='text-[8px] ml-2 text-blue-100 font-normal tracking-wide'>
                  (Multi-pilih, cascading dinamis)
                </span>
              </div>
              <button className='bg-white text-blue-600 p-1 rounded hover:bg-slate-50 transition-colors shadow-sm'>
                <ChevronUp
                  size={16}
                  strokeWidth={2.5}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                />
              </button>
            </div>

            {/* Konten Filter */}
            <div
              className='p-4 flex flex-col gap-3'
              style={{ display: isFilterOpen ? 'flex' : 'none' }}
            >
              {/* Baris 1: Filter Tanggal Input */}
              <div className='border border-slate-200 rounded-lg p-2 flex flex-col sm:flex-row items-start sm:items-center bg-white shadow-sm max-w-full'>
                <div className='flex items-center text-xs font-semibold text-gray-600 min-w-max mr-3 px-1 sm:mb-0 mb-2'>
                  <Calendar
                    size={14}
                    className='mr-2 text-blue-500'
                    strokeWidth={2.5}
                  />
                  Tanggal Input:
                </div>
                <div className='flex items-center gap-2'>
                  <input
                    type='date'
                    className='w-40 text-xs h-8 shadow-none'
                    placeholder='mm/dd/yyyy'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className='text-gray-400 font-semibold'>-</span>
                  <input
                    type='date'
                    className='w-40 text-xs h-8 shadow-none'
                    placeholder='mm/dd/yyyy'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Baris 2: Tombol Filter (Bulan, Produk, Merek, dll) */}
              <div className='flex flex-wrap lg:flex-nowrap gap-2 w-full mt-1'>
                {filterButtons.map((btn, idx) => {
                  const IconComponent = btn.icon
                  return (
                    <button
                      key={idx}
                      className='flex flex-1 items-center justify-center gap-1.5 py-[7px] px-2 text-xs font-semibold border-[1.5px] border-[#ced4da] rounded-lg bg-white cursor-pointer text-[#495057] transition-all duration-150 select-none box-border truncate hover:bg-slate-50 hover:border-slate-400 min-w-[120px]'
                    >
                      <IconComponent
                        size={10}
                        className='text-slate-500 shrink-0'
                        strokeWidth={2}
                      />
                      <span className='truncate'>{btn.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <section className='bg-white mt-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            {/* Header Biru Filter */}
            <div className='bg-[#1E3B62] text-white px-6 h-10 flex items-center justify-between'>
              <div className='flex items-center'>
                <BarChart2 size={12} className='mr-2' strokeWidth={2.5} />
                <strong className='text-[8px] font-bold tracking-wide'>
                  Analis Data Tracking
                </strong>
                <span className='text-[8px] ml-2 text-blue-100 font-normal tracking-wide'>
                  (Klik baris tabel analisa untuk filter data)
                </span>
              </div>
              <button className='bg-white text-blue-600 p-1 rounded hover:bg-slate-50 transition-colors shadow-sm'>
                <ChevronUp
                  size={16}
                  strokeWidth={2.5}
                  onClick={() => setIsFilterOpen2(!isFilterOpen2)}
                />
              </button>
            </div>

            {/* Konten Filter */}
            <div
              className='p-4 flex flex-col gap-3'
              style={{ display: isFilterOpen2 ? 'flex' : 'none' }}
            >
              <div className='flex flex-col md:flex-row gap-3 w-full'>
                {/* Card 2: Total Data Unik */}
                <div className='w-full md:w-full'>
                  <div className='flex flex-col border-0 h-full border-l-4 border-l-[#2563eb] bg-[#f8fbff] rounded-lg shadow-sm'>
                    <div className='py-2 px-3 flex flex-col justify-between'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div className='rounded-full flex items-center justify-center text-white shrink-0 w-9 h-9 bg-linear-to-br from-[#2563eb] to-[#1e40af]'>
                            <Users size={14} className='text-white' />
                          </div>
                          <div>
                            <div className='font-bold text-[12px] text-[#1e293b]'>
                              Total Data Unik
                            </div>
                            <div className='text-[10px] text-slate-500'>
                              No HP + Nama Entitas (kol. T & E)
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div
                            className='font-bold text-[1.8rem] leading-none text-blue-600'
                            id='statTotalUnik'
                          >
                            14
                          </div>
                          <div className='text-[10px] text-slate-500'>
                            kontak unik
                          </div>
                        </div>
                      </div>
                      <div className='w-full bg-[#dbeafe] rounded-full h-0.75 mt-2'>
                        <div className='bg-blue-600 h-0.75 rounded-full w-full'></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Total Kontak WA Unik */}
                <div className='w-full md:w-full'>
                  <div className='flex flex-col border-0 h-full border-l-4 border-l-[#16a34a] bg-[#f0fdf4] rounded-lg shadow-sm'>
                    <div className='py-2 px-3 flex flex-col justify-between'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div className='rounded-full flex items-center justify-center text-white shrink-0 w-9 h-9 bg-gradient-to-br from-[#16a34a] to-[#15803d]'>
                            <PhoneCallIcon
                              size={14}
                              className='text-white'
                              strokeWidth={2.5}
                            />
                          </div>
                          <div>
                            <div className='font-bold text-[12px] text-[#1e293b]'>
                              Total Kontak WA Unik
                            </div>
                            <div className='text-[10px] text-slate-500'>
                              Tipe Kontak WA / WhatsApp (kol. U)
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div
                            className='font-bold text-[1.8rem] leading-none text-green-600'
                            id='statWaUnik'
                          >
                            14
                          </div>
                          <div className='text-[10px] text-slate-500'>
                            <span id='statWaPct'>14</span>% dari total
                          </div>
                        </div>
                      </div>
                      <div className='w-full bg-green-200 rounded-full h-[3px] mt-2 flex'>
                        <div
                          className='bg-green-600 h-[3px] rounded-full w-0'
                          id='progWaUnik'
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className='flex flex-col md:flex-row gap-3 w-full px-4 pb-4'
              style={{ display: isFilterOpen2 ? 'flex' : 'none' }}
            >
              {/* Panel Kiri: Data Unik per Provinsi & Kota */}
              <div className='flex flex-col flex-1 rounded-lg border border-blue-100 overflow-hidden shadow-sm'>
                {/* Header Panel Kiri */}
                <div
                  className='flex items-center justify-between px-3 py-[6px]'
                  style={{
                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    borderBottom: '2px solid #2563eb',
                  }}
                >
                  <div className='flex items-center gap-1.5'>
                    <MapPinCheck
                      size={13}
                      className='text-blue-600 shrink-0'
                      strokeWidth={2.5}
                    />
                    <span className='text-[11px] font-bold text-[#1e293b]'>
                      Data Unik per Provinsi &amp; Kota
                    </span>
                  </div>
                  <div className='flex items-center gap-1 text-[10px] text-slate-500'>
                    <span
                      id='statProvinsiRows'
                      className='font-semibold text-blue-700'
                    >
                      14
                    </span>
                    <span>baris</span>
                    <span className='mx-0.5 text-slate-300'>|</span>
                    <span
                      id='statProvinsiTotal'
                      className='font-semibold text-blue-700'
                    >
                      14
                    </span>
                    <span>total</span>
                  </div>
                </div>
                {/* Tabel */}
                <div className='max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-blue-50 [&::-webkit-scrollbar-thumb]:bg-blue-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-400'>
                  <table className='w-full text-left border-collapse'>
                    <thead className='sticky top-0 z-10 bg-[#f1f5f9]'>
                      <tr>
                        <th className='px-2 py-1.5 text-[10px] font-semibold text-slate-500 w-7'>
                          #
                        </th>
                        <th className='px-2 py-1.5 text-[10px] font-semibold text-slate-500'>
                          Provinsi
                        </th>
                        <th className='px-2 py-1.5 text-[10px] font-semibold text-slate-500'>
                          Kota/Kab
                        </th>
                        <th className='px-2 py-1.5 text-[10px] font-semibold text-slate-500 text-right'>
                          Unik
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      id='tbodyProvinsiUnik'
                      className='divide-y divide-gray-100'
                    >
                      {[
                        {
                          no: 1,
                          prov: 'Aceh',
                          kota: 'Kabupaten Pidie',
                          unik: 1,
                          pct: 4,
                        },
                        {
                          no: 2,
                          prov: 'Aceh',
                          kota: 'Kota Banda Aceh',
                          unik: 36,
                          pct: 90,
                        },
                        {
                          no: 3,
                          prov: 'Bali',
                          kota: 'Kabupaten Badung',
                          unik: 1,
                          pct: 3,
                        },
                        {
                          no: 4,
                          prov: 'Bali',
                          kota: 'Kabupaten Gianyar',
                          unik: 1,
                          pct: 3,
                        },
                        {
                          no: 5,
                          prov: 'Bali',
                          kota: 'Kabupaten Jembrana',
                          unik: 1,
                          pct: 3,
                        },
                        {
                          no: 6,
                          prov: 'Bali',
                          kota: 'Kabupaten Klungkung',
                          unik: 1,
                          pct: 3,
                        },
                        {
                          no: 7,
                          prov: 'Bali',
                          kota: 'Kabupaten Tabanan',
                          unik: 2,
                          pct: 5,
                        },
                        {
                          no: 8,
                          prov: 'Banten',
                          kota: 'Kabupaten Pandeglang',
                          unik: 3,
                          pct: 8,
                        },
                        {
                          no: 9,
                          prov: 'Banten',
                          kota: 'Kabupaten Tangerang',
                          unik: 5,
                          pct: 13,
                        },
                        {
                          no: 10,
                          prov: 'Banten',
                          kota: 'Kota Serang',
                          unik: 2,
                          pct: 5,
                        },
                        {
                          no: 11,
                          prov: 'Banten',
                          kota: 'Kota Tangerang',
                          unik: 9,
                          pct: 23,
                        },
                        {
                          no: 12,
                          prov: 'DKI Jakarta',
                          kota: 'Jakarta Pusat',
                          unik: 4,
                          pct: 10,
                        },
                        {
                          no: 13,
                          prov: 'DKI Jakarta',
                          kota: 'Jakarta Selatan',
                          unik: 6,
                          pct: 15,
                        },
                        {
                          no: 14,
                          prov: 'DKI Jakarta',
                          kota: 'Jakarta Utara',
                          unik: 2,
                          pct: 5,
                        },
                      ].map((row) => (
                        <tr
                          key={row.no}
                          className='hover:bg-blue-50/50 transition-colors cursor-pointer'
                        >
                          <td className='px-2 py-1.5 text-[10px] text-slate-400'>
                            {row.no}
                          </td>
                          <td className='px-2 py-1.5 text-[10px] text-slate-700 font-medium'>
                            {row.prov}
                          </td>
                          <td className='px-2 py-1.5 text-[10px] text-slate-600'>
                            <div className='flex items-center gap-1.5'>
                              <span>{row.kota}</span>
                              <div className='flex-1 min-w-[36px] bg-blue-100 rounded-full h-[4px] overflow-hidden'>
                                <div
                                  className='bg-blue-500 h-full rounded-full'
                                  style={{ width: `${row.pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className='px-2 py-1.5 text-right'>
                            <span className='inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white'>
                              {row.unik}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Panel Kanan: Kontak WA Unik per Provinsi & Kota */}
              <div className='flex flex-col flex-1 rounded-lg border border-green-100 overflow-hidden shadow-sm'>
                {/* Header Panel Kanan */}
                <div
                  className='flex items-center justify-between px-3 py-[6px]'
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    borderBottom: '2px solid #16a34a',
                  }}
                >
                  <div className='flex items-center gap-1.5'>
                    <PhoneCallIcon
                      size={13}
                      className='text-green-600 shrink-0'
                      strokeWidth={2.5}
                    />
                    <span className='text-[11px] font-bold text-[#1e293b]'>
                      Kontak WA Unik per Provinsi &amp; Kota
                    </span>
                  </div>
                  <div className='flex items-center gap-1 text-[10px] text-slate-500'>
                    <span
                      id='statWaProvinsiRows'
                      className='font-semibold text-green-700'
                    >
                      14
                    </span>
                    <span>baris</span>
                    <span className='mx-0.5 text-slate-300'>|</span>
                    <span
                      id='statWaProvinsiTotal'
                      className='font-semibold text-green-700'
                    >
                      14
                    </span>
                    <span>total</span>
                  </div>
                </div>
                {/* Tabel */}
                <div className='max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-green-50 [&::-webkit-scrollbar-thumb]:bg-green-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-green-400'>
                  <table className='w-full text-left border-collapse'>
                    <thead className='sticky top-0 z-10 bg-[#f1f5f9]'>
                      <tr>
                        <th className='px-2 py-1.5 text-[10px] font-semibold text-slate-500 w-7'>
                          #
                        </th>
                        <th className='px-2 py-1.5 text-[10px] font-semibold text-slate-500'>
                          Provinsi
                        </th>
                        <th className='px-2 py-1.5 text-[10px] font-semibold text-slate-500'>
                          Kota/Kab
                        </th>
                        <th className='px-2 py-1.5 text-[10px] font-semibold text-slate-500 text-right'>
                          WA Unik
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      id='tbodyWaProvinsi'
                      className='divide-y divide-gray-100'
                    >
                      {[
                        {
                          no: 1,
                          prov: 'Aceh',
                          kota: 'Kota Banda Aceh',
                          unik: 2,
                          pct: 20,
                        },
                        {
                          no: 2,
                          prov: 'Bali',
                          kota: 'Kabupaten Tabanan',
                          unik: 2,
                          pct: 20,
                        },
                        {
                          no: 3,
                          prov: 'Bali',
                          kota: 'Kota Denpasar',
                          unik: 4,
                          pct: 40,
                        },
                        {
                          no: 4,
                          prov: 'Banten',
                          kota: 'Kabupaten Pandeglang',
                          unik: 2,
                          pct: 20,
                        },
                        {
                          no: 5,
                          prov: 'Banten',
                          kota: 'Kabupaten Tangerang',
                          unik: 3,
                          pct: 30,
                        },
                        {
                          no: 6,
                          prov: 'Banten',
                          kota: 'Kota Serang',
                          unik: 2,
                          pct: 20,
                        },
                        {
                          no: 7,
                          prov: 'Danten',
                          kota: 'Kota Tangerang',
                          unik: 9,
                          pct: 90,
                        },
                        {
                          no: 8,
                          prov: 'Aceh',
                          kota: 'Kota Banda Aceh',
                          unik: 2,
                          pct: 20,
                        },
                        {
                          no: 9,
                          prov: 'Bali',
                          kota: 'Kabupaten Tabanan',
                          unik: 2,
                          pct: 20,
                        },
                        {
                          no: 10,
                          prov: 'Bali',
                          kota: 'Kota Denpasar',
                          unik: 4,
                          pct: 40,
                        },
                        {
                          no: 11,
                          prov: 'Banten',
                          kota: 'Kabupaten Pandeglang',
                          unik: 2,
                          pct: 20,
                        },
                        {
                          no: 12,
                          prov: 'Banten',
                          kota: 'Kabupaten Tangerang',
                          unik: 3,
                          pct: 30,
                        },
                        {
                          no: 13,
                          prov: 'Banten',
                          kota: 'Kota Serang',
                          unik: 2,
                          pct: 20,
                        },
                        {
                          no: 14,
                          prov: 'Danten',
                          kota: 'Kota Tangerang',
                          unik: 9,
                          pct: 90,
                        },
                      ].map((row) => (
                        <tr
                          key={row.no}
                          className='hover:bg-green-50/50 transition-colors cursor-pointer'
                        >
                          <td className='px-2 py-1.5 text-[10px] text-slate-400'>
                            {row.no}
                          </td>
                          <td className='px-2 py-1.5 text-[10px] text-slate-700 font-medium'>
                            {row.prov}
                          </td>
                          <td className='px-2 py-1.5 text-[10px] text-slate-600'>
                            <div className='flex items-center gap-1.5'>
                              <span>{row.kota}</span>
                              <div className='flex-1 min-w-[36px] bg-green-100 rounded-full h-[4px] overflow-hidden'>
                                <div
                                  className='bg-green-500 h-full rounded-full'
                                  style={{ width: `${row.pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className='px-2 py-1.5 text-right'>
                            <span className='inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-600 text-white'>
                              {row.unik}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
          {/* {Table 2} */}
          <div className='mt-4 overflow-hidden rounded-2xl bg-blue shadow-sm ring-1 ring-gray-200'>
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm text-left items-center'>
                <thead className='bg-blue-600 justify-center'>
                  <tr>
                    {[
                      'No',
                      'Aksi',
                      'Kode',
                      'Nama Perusahaan',
                      'Kota',
                      'Provinsi',
                      'Produk',
                      'PIC',
                      'Jabatan',
                      'Telp',
                      'Tipe',
                    ].map((h) => (
                      <th
                        key={h}
                        className='px-2 py-2.5 text-[10px] font-semibold text-white'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className='divide-y divide-gray-300'>
                  {/* {loading ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-6 py-12 text-center text-sm text-gray-700"
                      >
                        <div className="flex justtify-center items-center gap-2">
                          <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                          <span>Memuat Data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    resp?.map((row) => (
                      <tr key={row.kode} className="hover:bg-green-50/50 transition-colors cursor-pointer">
                        <td className="px-2 py-1.5 text-[10px] text-slate-400">{row.kode}</td>
                        <td className="px-2 py-1.5 text-[10px] text-slate-700 font-medium">{row.nama_perusahaan}</td>
                        <td className="px-2 py-1.5 text-[10px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span>{row.kota}</span>
                            <div className="flex-1 min-w-[36px] bg-green-100 rounded-full h-[4px] overflow-hidden">
                              <div className="bg-green-500 h-full rounded-full" />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-600 text-white"></span>
                        </td>
                      </tr>
                    ))
                  )} */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr
                      key={i}
                      className='hover:bg-green-50/50 transition-colors cursor-pointer border-b border-gray-200'
                    >
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        {i + 1}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        Hapus
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        YTK-011225-0001
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        ASRI PRATAMA MANDIRI
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        Kota Palembang
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        Sumatera Selatan
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        GENSET
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        Rama
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        Kepala IT
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        090789793232
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-black-400'>
                        Whatsapp
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
  )
}
