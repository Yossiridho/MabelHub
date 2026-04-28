'use client'

import DatePicker from '@/components/ui/DatePicker'
import {
  Calendar,
  ChevronUp,
  Filter,
  Package,
  MessageCircleCodeIcon,
  Building2,
  MapPin,
  Users,
  Map as MapIcon,
  BarChart2,
  PhoneCallIcon,
  Phone,
  MapPinCheck,
  Eye,
  Send,
  ChevronDown,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function TrackingBroadcastPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isFilterOpen2, setIsFilterOpen2] = useState(false)
  const [statusWa, setStatusWa] = useState('')
  const [toSales, setToSales] = useState('')

  const filterButtons = [
    { id: 'Perusahaan', icon: Building2, label: 'Perusahaan' },
    { id: 'Produk', icon: Package, label: 'Produk' },
    { id: 'Provinsi', icon: MapIcon, label: 'Provinsi' },
    { id: 'Kota', icon: MapPin, label: 'Kota/Kab' },
    { id: 'Status Wa', icon: MessageCircleCodeIcon, label: 'Status WA' },
    { id: 'Ke Sales', icon: Users, label: 'Ke Sales' },
  ]
  return (
    <div className='min-h-screen bg-blue-50'>
      <div className='flex'>
        <div className='flex-1 p-6'>
          <div className='bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100'>
            <div className='flex flex-col'>
              <h4 className='text-[20px] mb-1 font-extrabold text-(--gray-800) m-0 tracking-[-0.5px]'>
                Tracking Broadcast WA
              </h4>
              <p className='text-sm ml-1 text-slate-500 font-medium'>
                Monitor status pengiriman pesan dari sheet DATA WA
              </p>
            </div>
          </div>
          <section className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='bg-[#1ae862] text-white px-6 h-10 flex items-center justify-between'>
              <div className='flex items-center'>
                <Filter size={12} className='mr-2' strokeWidth={2.5} />
                <strong className='text-[8px] font-bold tracking-wide'>
                  Filter Data Broadcast
                </strong>
                <span className='text-[8px] ml-2 text-blue-100 font-normal tracking-wide'>
                  (Multi-pilih, cascading dinamis)
                </span>
              </div>
              <button className='bg-white text-blue-600 p-1 rounded hover:bg-slate-50 transition-colors shadow-sm cursor-pointer' aria-label={isFilterOpen ? "Tutup filter" : "Buka filter"}>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={isFilterOpen ? "rotate-180" : ""}
                  
                />
              </button>
            </div>
            {/* {Konten Filter} */}
            <div
              className='p-4 border-t border-gray-200'
              style={{ display: isFilterOpen ? 'block' : 'none' }}
            >
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
                  <DatePicker
                    className='w-40 text-xs h-8 shadow-none'
                    placeholder='mm/dd/yyyy'
                  />
                  <span className='text-gray-400 font-semibold'>-</span>
                  <DatePicker
                    className='w-40 text-xs h-8 shadow-none'
                    placeholder='mm/dd/yyyy'
                  />
                </div>
              </div>
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
              <p className='text-xs text-gray-500 mt-2'>
                Klik tombol filter → centang pilihan. Bisa pilih lebih dari
                satu.
              </p>
            </div>
          </section>
          <section className='bg-white mt-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='bg-[#095D4B] text-white px-6 h-10 flex items-center justify-between'>
              <div className='flex items-center'>
                <BarChart2 size={12} className='mr-2' strokeWidth={2.5} />
                <strong className='text-[8px] font-bold tracking-wide'>
                  Analis Data Broadcast
                </strong>
                <span className='text-[8px] ml-2 text-blue-100 font-normal tracking-wide'>
                  (Klik baris tabel untuk drill-down)
                </span>
              </div>
              <button className='bg-white text-blue-600 p-1 rounded hover:bg-slate-50 transition-colors shadow-sm cursor-pointer' aria-label={isFilterOpen ? "Tutup filter" : "Buka filter"}>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  onClick={() => setIsFilterOpen2(!isFilterOpen2)}
                  className={isFilterOpen2 ? "rotate-180" : ""}
                />
              </button>
            </div>

            {/* {Konten Filter 2} */}
            <div
              className='p-4 flex flex-col gap-3'
              style={{ display: isFilterOpen2 ? 'flex' : 'none' }}
            >
              <div className='flex flex-col md:flex-row gap-3 w-full'>
                {/* Card Kiri: Total Unik No HP */}
                <div className='shrink-0 md:w-auto w-full'>
                  <div className='flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3 h-full min-w-[200px]'>
                    <div className='rounded-full flex items-center justify-center text-white shrink-0 w-9 h-9 bg-gradient-to-br from-green-500 to-teal-600'>
                      <PhoneCallIcon
                        size={14}
                        className='text-white'
                        strokeWidth={2}
                      />
                    </div>
                    <div className='flex flex-col'>
                      <div className='font-bold text-[12px] text-black leading-tight'>
                        Total Unik No HP
                      </div>
                      <div className='text-[10px] text-slate-400'>
                        Kolom G (picTelp) unik
                      </div>
                    </div>
                    <div className='ml-auto text-right'>
                      <div
                        className='font-extrabold text-[1.8rem] leading-none text-green-500'
                        id='statWaUnik'
                      >
                        559
                      </div>
                      <div className='text-[10px] text-slate-400'>kontak</div>
                    </div>
                  </div>
                </div>

                {/* Panel Kanan: Distribusi Status WA */}
                <div className='flex-1 min-w-0'>
                  <div className='bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2.5 h-full'>
                    <div className='flex items-center gap-1.5 mb-2'>
                      <span className='inline-block w-2 h-2 rounded-full bg-green-500 shrink-0'></span>
                      <span className='font-bold text-[11px] text-slate-700'>
                        Distribusi Status WA
                      </span>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {/* Terkirim (1C) */}
                      <div className='flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5'>
                        <span className='w-2 h-2 rounded-full bg-slate-400 shrink-0'></span>
                        <span className='text-[10px] text-slate-600 font-medium whitespace-nowrap'>
                          Terkirim (1C)
                        </span>
                        <span className='text-[10px] font-bold text-slate-700 ml-0.5' id='statTerkirim'>11</span>
                      </div>
                      {/* Diterima (2C) */}
                      <div className='flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5'>
                        <span className='w-2 h-2 rounded-full bg-blue-400 shrink-0'></span>
                        <span className='text-[10px] text-blue-700 font-medium whitespace-nowrap'>
                          Diterima (2C)
                        </span>
                        <span className='text-[10px] font-bold text-blue-800 ml-0.5' id='statDiterima'>37</span>
                      </div>
                      {/* Dibaca - Belum Respons */}
                      <div className='flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-2.5 py-0.5'>
                        <span className='w-2 h-2 rounded-full bg-yellow-400 shrink-0'></span>
                        <span className='text-[10px] text-yellow-700 font-medium whitespace-nowrap'>
                          Dibaca - Belum Respons
                        </span>
                        <span className='text-[10px] font-bold text-yellow-800 ml-0.5' id='statBelumRespons'>74</span>
                      </div>
                      {/* Dibaca - Respons Positif */}
                      <div className='flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5'>
                        <span className='w-2 h-2 rounded-full bg-green-500 shrink-0'></span>
                        <span className='text-[10px] text-green-700 font-medium whitespace-nowrap'>
                          Dibaca - Respons Positif
                        </span>
                        <span className='text-[10px] font-bold text-green-800 ml-0.5' id='statResponsPositif'>14</span>
                      </div>
                      {/* Aktif Broadcast */}
                      <div className='flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-full px-2.5 py-0.5'>
                        <span className='w-2 h-2 rounded-full bg-purple-400 shrink-0'></span>
                        <span className='text-[10px] text-purple-700 font-medium whitespace-nowrap'>
                          Aktif Broadcast
                        </span>
                        <span className='text-[10px] font-bold text-purple-800 ml-0.5' id='statAktif'>6</span>
                      </div>
                      {/* Total angka */}
                      <div className='flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-0.5'>
                        <span className='w-2 h-2 rounded-full bg-orange-400 shrink-0'></span>
                        <span className='text-[10px] font-bold text-orange-700 ml-0.5' id='statTotal'>398</span>
                      </div>
                      {/* Kosong */}
                      <div className='flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5'>
                        <span className='w-2 h-2 rounded-full bg-amber-400 shrink-0'></span>
                        <span className='text-[10px] text-amber-700 font-medium whitespace-nowrap'>
                          (Kosong)
                        </span>
                        <span className='text-[10px] font-bold text-amber-800 ml-0.5' id='statKosong'>19</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Konten Filter */}
            <div
              className='flex flex-col md:flex-row gap-3 w-full px-4 pb-4 mt-1.5'
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
                      Unik No HP per Provinsi &amp; Kota
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
                      Unik No HP per Ke Sales
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
          <div className='mt-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden'>

            <div className='overflow-x-auto'>
              <table className='min-w-full text-left border-collapse'>
                {/* Header - dark blue like reference */}
                <thead className='sticky top-0 z-10'>
                  <tr className='bg-[#1a2c4e] text-white'>
                    {[
                      { label: "NO" },
                      { label: "👁 LIHAT" },
                      { label: "🏢 PERUSAHAAN" },
                      { label: "📦 PRODUK" },
                      { label: "📍 INFO LOKASI" },
                      { label: "👤 KONTAK PIC" },
                      { label: "💬 STATUS WA" },
                      { label: "➡ KE SALES" },
                      { label: "⚙" },
                    ].map((h) => (
                      <th
                        key={h.label}
                        className='px-2 py-2 text-[10px] font-bold tracking-wide whitespace-nowrap border-r border-[#243a5e] last:border-r-0'
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 15 }).map((_, i) => (
                    <tr
                      key={i}
                      className={`transition-colors cursor-pointer border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                    >
                      {/* No */}
                      <td className='px-2 py-2 text-[11px] font-semibold text-gray-500 w-8 text-center'>
                        {i + 1}
                      </td>
                      {/* Lihat - Eye & WA button */}
                      <td className='px-1 py-2 w-16'>
                        <div className='flex items-center gap-1'>
                          <button className='flex items-center justify-center w-6 h-6 rounded bg-[#0DCAF0] hover:bg-cyan-500 transition-colors shadow-sm'>
                            <Eye size={12} strokeWidth={2.5} color='white' />
                          </button>
                          <button className='flex items-center justify-center w-6 h-6 rounded bg-green-600 hover:bg-green-700 transition-colors shadow-sm'>
                            <Phone size={11} strokeWidth={2.5} color='white' />
                          </button>
                        </div>
                      </td>
                      {/* Perusahaan */}
                      <td className='px-2 py-2 text-[11px] font-semibold text-gray-800 whitespace-nowrap'>
                        PT. Maju Mundur
                      </td>
                      {/* Produk */}
                      <td className='px-2 py-2'>
                        <span className='inline-block text-[10px] text-blue-700 font-bold uppercase px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded'>
                          Genset
                        </span>
                      </td>
                      {/* Info Lokasi */}
                      <td className='px-2 py-2 text-[11px] text-gray-600 whitespace-nowrap'>
                        <div className='flex items-center gap-1'>
                          <MapPin size={10} strokeWidth={2.5} className='text-blue-500 shrink-0' />
                          <span>Kota Bandung, DKI Jakarta</span>
                        </div>
                      </td>
                      {/* Kontak PIC */}
                      <td className='px-2 py-2 text-[11px] text-gray-700'>
                        <div className='flex flex-col gap-0.5'>
                          <span className='font-semibold'>Abdul Rosyid (-)</span>
                          <span className='flex items-center gap-1 text-gray-500'>
                            <Phone size={9} strokeWidth={2} />08123456789
                          </span>
                        </div>
                      </td>
                      {/* Status WA */}
                      <td className='px-2 py-2'>
                        <select
                          value={statusWa}
                          onChange={(e) => setStatusWa(e.target.value)}
                          className='text-[10px] border border-gray-300 rounded px-1.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-36 cursor-pointer'
                        >
                          <option value="">- Pilih Status -</option>
                          <option value="Terkirim(1C)">Terkirim(1C)</option>
                          <option value="Diterima(2C)">Diterima(2C)</option>
                          <option value="Dibaca - Belum Respons">Dibaca - Belum Respons</option>
                          <option value="Dibaca - Respons - Positif">Dibaca - Respons - Positif</option>
                          <option value="Dibaca - Respons - Netral">Dibaca - Respons - Netral</option>
                          <option value="Dibaca - Respons - Negatif">Dibaca - Respons - Negatif</option>
                          <option value="Aktif Progres">Aktif Progres</option>
                        </select>
                      </td>
                      {/* Ke Sales */}
                      <td className='px-2 py-2'>
                        <select
                          value={toSales}
                          onChange={(e) => setToSales(e.target.value)}
                          className='text-[10px] border border-gray-300 rounded px-1.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-36 cursor-pointer'
                        >
                          <option value="">- Pilih Sales -</option>
                          <option value="Arie Muhammad Fajar">Arie Muhammad Fajar</option>
                          <option value="Beffy Rizkana">Beffy Rizkana</option>
                        </select>
                      </td>
                      {/* Opsi - Send */}
                      <td className='px-2 py-2'>
                        <button className='flex items-center justify-center w-7 h-7 rounded bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm'>
                          <Send size={12} strokeWidth={2.5} color='white' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Legend Footer */}
          <div className='flex flex-wrap items-center mt-4 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-[10px] text-gray-500'>
            <span className='flex items-center gap-1'><span className='inline-flex w-3 h-3 rounded-sm bg-[#0DCAF0]'></span>Data dari sheet <strong>DATA_WA</strong></span>
            <span className='flex items-center gap-1'><span className='inline-flex w-3 h-3 rounded-full bg-blue-500'></span>Klik <strong>👁</strong> untuk detail lengkap</span>
            <span className='flex items-center gap-1'><span className='inline-flex w-3 h-3 rounded-sm bg-gray-300'></span>Centang <strong>☑</strong> untuk submit massal</span>
            <span className='flex items-center gap-1 ml-auto'><span className='inline-flex px-1.5 py-0.5 rounded-sm bg-green-500 text-white font-bold text-[9px]'>STATUS WA</span> = Respons</span>
            <span className='flex items-center gap-1'><span className='inline-flex px-1.5 py-0.5 rounded-sm bg-yellow-400 text-white font-bold text-[9px]'>KE SALES</span> = Forward</span>
          </div>
        </div>
      </div>
    </div>
  )
}
