'use client'

import {
  Filter,
  ChevronUp,
  ChevronDown,
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
  X,
} from 'lucide-react'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import DatePicker from '@/components/ui/DatePicker'

type ProvinsiKotaRow = {
  no: number
  provinsi: string
  kota: string
  unik: number
  pct: number
}

type TrackingRow = {
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

type ApiStats = {
  total_no_telp: number
  total_provinsi: number
  total_kota: number
  total_nama: number
  total_kontak_unik: number
  total_wa_unik: number
  provinsi_kota: ProvinsiKotaRow[]
  wa_provinsi_kota: ProvinsiKotaRow[]
}

type FilterOptions = {
  bulan: string[]
  produk: string[]
  merek: string[]
  perusahaan: string[]
  provinsi: string[]
  kota: string[]
  tipe: string[]
}

function getPageWindow(current: number, totalPages: number, size: number) {
  if (totalPages <= size)
    return Array.from({ length: totalPages }, (_, i) => i + 1);

  const half = Math.floor(size / 2);
  let start = Math.max(1, current - half);
  let end = start + size - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - size + 1;
  }
  return Array.from({ length: size }, (_, i) => start + i);
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

  // filter value — multi-select arrays (empty = no filter)
  const [bulan,      setBulan]      = useState<string[]>([])
  const [produk,     setProduk]     = useState<string[]>([])
  const [merek,      setMerek]      = useState<string[]>([])
  const [perusahaan, setPerusahaan] = useState<string[]>([])
  const [provinsi,   setProvinsi]   = useState<string[]>([])
  const [kota,       setKota]       = useState<string[]>([])
  const [tipe,       setTipe]       = useState<string[]>([])

  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  // dropdown filter
  const [openDropdown, setOpenDropdown]   = useState<string | null>(null)
  const [dropdownSearch, setDropdownSearch] = useState<Record<string, string>>({})
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    bulan: [], produk: [], merek: [], perusahaan: [], provinsi: [], kota: [], tipe: [],
  })
  const dropdownRef = useRef<HTMLDivElement>(null)

  // pagination
  const [pageSize, setPageSize] = useState(25)
  const [page,     setPage]     = useState(1)
  const [rows,     setRows]     = useState<TrackingRow[]>([])
  const [loadingRows, setLoadingRows] = useState(true)
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selected,   setSelected]   = useState<TrackingRow | null>(null)

  // data — statistik & analitik
  const [loading, setLoading] = useState(true)
  const [stats,   setStats]   = useState<ApiStats | null>(null)

  // Fetch distinct filter options
  useEffect(() => {
    fetch('/api/tracking-database/filters')
      .then(r => r.json())
      .then((data: FilterOptions) => setFilterOptions(data))
      .catch(() => {})
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ---- filter helpers ----
  const getFilterArr = useCallback((id: string): string[] => {
    switch (id) {
      case 'Bulan':      return bulan
      case 'Produk':     return produk
      case 'Merek':      return merek
      case 'Perusahaan': return perusahaan
      case 'Provinsi':   return provinsi
      case 'Kota':       return kota
      case 'Tipe':       return tipe
      default: return []
    }
  }, [bulan, produk, merek, perusahaan, provinsi, kota, tipe])

  const setFilterArr = useCallback((id: string, vals: string[]) => {
    switch (id) {
      case 'Bulan':      setBulan(vals);      break
      case 'Produk':     setProduk(vals);     break
      case 'Merek':      setMerek(vals);      break
      case 'Perusahaan': setPerusahaan(vals); break
      case 'Provinsi':   setProvinsi(vals);   break
      case 'Kota':       setKota(vals);       break
      case 'Tipe':       setTipe(vals);       break
    }
    setPage(1); setSelected(null)
  }, [])

  const toggleFilterVal = useCallback((id: string, val: string) => {
    const cur = getFilterArr(id)
    setFilterArr(id, cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val])
  }, [getFilterArr, setFilterArr])

  const clearFilterArr = useCallback((id: string) => {
    setFilterArr(id, [])
    setOpenDropdown(null)
  }, [setFilterArr])

  const selectAllFilter = useCallback((id: string, opts: string[]) => {
    setFilterArr(id, [...opts])
  }, [setFilterArr])

  const getOptions = useCallback((id: string): string[] => {
    switch (id) {
      case 'Bulan':      return filterOptions.bulan
      case 'Produk':     return filterOptions.produk
      case 'Merek':      return filterOptions.merek
      case 'Perusahaan': return filterOptions.perusahaan
      case 'Provinsi':   return filterOptions.provinsi
      case 'Kota':       return filterOptions.kota
      case 'Tipe':       return filterOptions.tipe
      default: return []
    }
  }, [filterOptions])

  // ---- main data fetch (stats + paginated rows) ----
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingRows(true)
      if (!mounted) return
      setLoading(true)

      const qs = new URLSearchParams()
      qs.set('limit', String(pageSize))
      qs.set('page', String(page))

      bulan.forEach(v      => qs.append('bulan',      v))
      produk.forEach(v     => qs.append('produk',     v))
      merek.forEach(v      => qs.append('merek',      v))
      perusahaan.forEach(v => qs.append('perusahaan', v))
      provinsi.forEach(v   => qs.append('provinsi',   v))
      kota.forEach(v       => qs.append('kota',       v))
      tipe.forEach(v       => qs.append('tipe',       v))
      if (startDate) qs.set('startDate', startDate)
      if (endDate)   qs.set('endDate',   endDate)

      try {
        const res  = await fetch(`/api/tracking-database?${qs.toString()}`, { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!mounted) return

        if (json?.total_kontak_unik !== undefined) {
          setStats({
            total_no_telp:    json.total_no_telp    ?? 0,
            total_provinsi:   json.total_provinsi   ?? 0,
            total_kota:       json.total_kota       ?? 0,
            total_nama:       json.total_nama       ?? 0,
            total_kontak_unik: json.total_kontak_unik ?? 0,
            total_wa_unik:    json.total_wa_unik    ?? 0,
            provinsi_kota:    Array.isArray(json.provinsi_kota)    ? json.provinsi_kota    : [],
            wa_provinsi_kota: Array.isArray(json.wa_provinsi_kota) ? json.wa_provinsi_kota : [],
          })
        }

        setRows(Array.isArray(json?.items) ? json.items : [])
        const pg = json?.pagination ?? {}
        setTotal(Number(pg?.total ?? 0))
        setTotalPages(Number(pg?.totalPages ?? 1))
        setSelected(null)
      } catch {
        if (!mounted) return
        setRows([]); setTotal(0); setTotalPages(1); setSelected(null)
      } finally {
        if (mounted) { setLoadingRows(false); setLoading(false) }
      }
    })()
    return () => { mounted = false }
  }, [page, pageSize, bulan, produk, merek, perusahaan, provinsi, kota, tipe, startDate, endDate])

  const safePage = useMemo(
    () => Math.min(Math.max(1, page), Math.max(1, totalPages)),
    [page, totalPages],
  )
  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const showingTo   = Math.min(total, safePage * pageSize)
  const gotoPage    = (p: number) => setPage(Math.min(Math.max(1, p), Math.max(1, totalPages)))

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
                    className='w-30 text-xs h-8 shadow-none border-1 border-slate-300 rounded-lg'
                    placeholder='mm/dd/yyyy'
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); setSelected(null); }}
                  />
                  <span className='text-gray-400 font-semibold'>-</span>
                  <input
                    type='date'
                    className='w-30 items-center justify-between text-xs h-8 shadow-none border-1 border-slate-300 rounded-lg'
                    placeholder='mm/dd/yyyy'
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); setSelected(null); }}
                  />
                </div>
              </div>

              {/* Baris 2: Tombol Filter dengan Dropdown */}
              <div ref={dropdownRef} className='flex flex-wrap lg:flex-nowrap gap-2 w-full mt-1'>
                {filterButtons.map((btn) => {
                  const IconComponent = btn.icon
                  const activeArr = getFilterArr(btn.id)
                  const count     = activeArr.length
                  const isActive  = count > 0
                  const opts      = getOptions(btn.id)
                  const search    = dropdownSearch[btn.id] ?? ''
                  const filtered  = search ? opts.filter(o => o.toLowerCase().includes(search.toLowerCase())) : opts
                  const allSelected = opts.length > 0 && opts.every(o => activeArr.includes(o))
                  return (
                    <div key={btn.id} className='relative flex-1 min-w-[110px]'>
                      {/* ---- Trigger button ---- */}
                      <button
                        type='button'
                        onClick={() => setOpenDropdown(openDropdown === btn.id ? null : btn.id)}
                        className={`w-full flex items-center justify-between gap-1 py-[7px] px-2 text-xs font-semibold border-[1.5px] rounded-lg cursor-pointer transition-all duration-150 select-none box-border ${
                          isActive
                            ? 'border-blue-500 bg-white text-blue-700'
                            : 'border-[#ced4da] bg-white text-[#495057] hover:bg-slate-50 hover:border-slate-400'
                        }`}
                      >
                        <span className='flex items-center gap-1 min-w-0'>
                          <IconComponent size={10} className='shrink-0' strokeWidth={2} />
                          <span className='truncate text-[10px]'>{btn.label}</span>
                        </span>
                        <span className='flex items-center gap-0.5 shrink-0'>
                          {isActive && (
                            <span className='inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold'>
                              {count}
                            </span>
                          )}
                          <ChevronDown size={10} className={`ml-0.5 transition-transform ${openDropdown === btn.id ? 'rotate-180' : ''}`} />
                        </span>
                      </button>

                      {/* ---- Dropdown panel ---- */}
                      {openDropdown === btn.id && (
                        <div className='absolute top-full left-0 z-[999] mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden'>
                          {/* Search */}
                          <div className='px-2 pt-2 pb-1'>
                            <input
                              autoFocus
                              type='text'
                              placeholder='Cari...'
                              value={search}
                              onChange={e => setDropdownSearch(prev => ({ ...prev, [btn.id]: e.target.value }))}
                              className='w-full text-[11px] px-2 py-1.5 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-300'
                            />
                          </div>
                          {/* Semua / Hapus */}
                          <div className='flex items-center gap-1 px-2 pb-1'>
                            <button
                              type='button'
                              onClick={() => selectAllFilter(btn.id, opts)}
                              className='flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 px-1'
                            >
                              ✓ Semua
                            </button>
                            <span className='text-gray-300'>|</span>
                            <button
                              type='button'
                              onClick={() => clearFilterArr(btn.id)}
                              className='flex items-center gap-1 text-[10px] font-semibold text-red-500 hover:text-red-700 px-1'
                            >
                              ✕ Hapus
                            </button>
                          </div>
                          {/* Option list */}
                          <div className='max-h-48 overflow-y-auto border-t border-gray-100'>
                            {filtered.length === 0 ? (
                              <div className='px-3 py-2 text-[10px] text-slate-400 text-center'>Tidak ada data</div>
                            ) : filtered.map(opt => {
                              const checked = activeArr.includes(opt)
                              return (
                                <label
                                  key={opt}
                                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${checked ? 'bg-blue-50/60' : ''}`}
                                >
                                  <input
                                    type='checkbox'
                                    checked={checked}
                                    onChange={() => toggleFilterVal(btn.id, opt)}
                                    className='accent-blue-600 w-3.5 h-3.5 shrink-0'
                                  />
                                  <span className={`text-[11px] truncate ${checked ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>
                                    {opt}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ---- Chips row: active selections ---- */}
              {filterButtons.some(b => getFilterArr(b.id).length > 0) && (
                <div className='flex flex-wrap gap-1 mt-1.5'>
                  {filterButtons.flatMap(btn =>
                    getFilterArr(btn.id).map(val => (
                      <span
                        key={`${btn.id}-${val}`}
                        className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200'
                      >
                        {btn.label}: {val}
                        <button
                          type='button'
                          onClick={() => toggleFilterVal(btn.id, val)}
                          className='hover:text-red-500 ml-0.5'
                        >
                          <X size={9} />
                        </button>
                      </span>
                    ))
                  )}
                  <button
                    type='button'
                    onClick={() => filterButtons.forEach(b => clearFilterArr(b.id))}
                    className='text-[10px] text-red-500 hover:text-red-700 font-semibold ml-1'
                  >
                    Reset Semua
                  </button>
                </div>
              )}
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
                            {loading ? '...' : (stats?.total_kontak_unik ?? 0)}
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
                            {loading ? '...' : (stats?.total_wa_unik ?? 0)}
                          </div>
                          <div className='text-[10px] text-slate-500'>
                            <span id='statWaPct'>
                              {loading || !stats
                                ? '...'
                                : stats.total_kontak_unik > 0
                                  ? Math.round((stats.total_wa_unik / stats.total_kontak_unik) * 100)
                                  : 0}
                            </span>% dari total
                          </div>
                        </div>
                      </div>
                      <div className='w-full bg-green-200 rounded-full h-[3px] mt-2 flex'>
                        <div
                          className='bg-green-600 h-[3px] rounded-full transition-all duration-700'
                          id='progWaUnik'
                          style={{
                            width: loading || !stats || stats.total_kontak_unik === 0
                              ? '0%'
                              : `${Math.round((stats.total_wa_unik / stats.total_kontak_unik) * 100)}%`
                          }}
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
                      {loading ? '...' : (stats?.provinsi_kota.length ?? 0)}
                    </span>
                    <span>baris</span>
                    <span className='mx-0.5 text-slate-300'>|</span>
                    <span
                      id='statProvinsiTotal'
                      className='font-semibold text-blue-700'
                    >
                      {loading ? '...' : (stats?.total_kontak_unik ?? 0)}
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
                      {loading ? (
                        <tr>
                          <td colSpan={4} className='px-2 py-4 text-center text-[10px] text-slate-400'>
                            Memuat data...
                          </td>
                        </tr>
                      ) : (stats?.provinsi_kota ?? []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className='px-2 py-4 text-center text-[10px] text-slate-400'>
                            Tidak ada data
                          </td>
                        </tr>
                      ) : (stats?.provinsi_kota ?? []).map((row) => (
                        <tr
                          key={row.no}
                          onClick={() => {
                            setProvinsi([row.provinsi])
                            setKota([row.kota])
                            setPage(1)
                            setSelected(null)
                          }}
                          className={`transition-colors cursor-pointer ${
                            provinsi.includes(row.provinsi) && kota.includes(row.kota)
                              ? 'bg-blue-100 ring-1 ring-inset ring-blue-400'
                              : 'hover:bg-blue-50/70'
                          }`}
                        >
                          <td className='px-2 py-1.5 text-[10px] text-slate-400'>
                            {row.no}
                          </td>
                          <td className='px-2 py-1.5 text-[10px] text-slate-700 font-medium'>
                            {row.provinsi}
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
                      {loading ? '...' : (stats?.wa_provinsi_kota.length ?? 0)}
                    </span>
                    <span>baris</span>
                    <span className='mx-0.5 text-slate-300'>|</span>
                    <span
                      id='statWaProvinsiTotal'
                      className='font-semibold text-green-700'
                    >
                      {loading ? '...' : (stats?.total_wa_unik ?? 0)}
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
                      {loading ? (
                        <tr>
                          <td colSpan={4} className='px-2 py-4 text-center text-[10px] text-slate-400'>
                            Memuat data...
                          </td>
                        </tr>
                      ) : (stats?.wa_provinsi_kota ?? []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className='px-2 py-4 text-center text-[10px] text-slate-400'>
                            Tidak ada data
                          </td>
                        </tr>
                      ) : (stats?.wa_provinsi_kota ?? []).map((row) => (
                        <tr
                          key={row.no}
                          onClick={() => {
                            setProvinsi([row.provinsi])
                            setKota([row.kota])
                            setTipe(['WhatsApp'])
                            setPage(1)
                            setSelected(null)
                          }}
                          className={`transition-colors cursor-pointer ${
                            provinsi.includes(row.provinsi) && kota.includes(row.kota) && tipe.includes('WhatsApp')
                              ? 'bg-green-100 ring-1 ring-inset ring-green-400'
                              : 'hover:bg-green-50/70'
                          }`}
                        >
                          <td className='px-2 py-1.5 text-[10px] text-slate-400'>
                            {row.no}
                          </td>
                          <td className='px-2 py-1.5 text-[10px] text-slate-700 font-medium'>
                            {row.provinsi}
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
              <table className='min-w-full text-sm text-left items-center bg-white'>
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
                  {loadingRows ? (
                    <tr>
                      <td colSpan={11} className='px-6 py-8 text-center text-[10px] text-gray-500'>
                        <div className='flex justify-center items-center gap-2'>
                          <span className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></span>
                          <span>Memuat Data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className='px-6 py-8 text-center text-[10px] text-gray-500'>
                        Tidak ada data
                      </td>
                    </tr>
                  ) : rows.map((row, i) => (
                    <tr
                      key={row.kode + i}
                      className='hover:bg-blue-50/50 transition-colors cursor-pointer border-b border-gray-200'
                    >
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-500'>
                        {(safePage - 1) * pageSize + i + 1}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-red-500 font-medium cursor-pointer hover:underline'>
                        Hapus
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-700 font-mono'>
                        {row.kode}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-700 font-medium'>
                        {row.nama_perusahaan}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-600'>
                        {row.kota}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-600'>
                        {row.provinsi}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-600'>
                        {row.produk}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-700 font-medium'>
                        {row.pic}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-600'>
                        {row.jabatan}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-600 font-mono'>
                        {row.telp}
                      </td>
                      <td className='whitespace-nowrap px-2 py-1.5 text-[10px]'>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          row.tipe === 'WhatsApp'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.tipe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          <section className='mt-6 flex flex-col gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-blue-100 md:flex-row md:items-center md:justify-between'>
            <div className='text-sm text-gray-500 font-medium'>
              <p className='font-medium text-gray-700'>
                Showing <strong>{showingFrom}</strong> to{' '}
                <strong>{showingTo}</strong> of <strong>{total}</strong>{' '}
                entries
              </p>
              <div className='flex flex-wrap items-center gap-3'>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className='h-10 rounder-xl border border-blue-100 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                >
                  <option value={10}>10 / Halaman</option>
                  <option value={20}>20 / Halaman</option>
                  <option value={50}>50 / Halaman</option>
                  <option value={100}>100 / Halaman</option>
                </select>
                <div className='flex items-center gap-2'>
                  <PageBtn onClick={() => gotoPage(1)} ariaLabel="First">
                    ⏮
                  </PageBtn>
                  <PageBtn onClick={() => gotoPage(page - 1)} ariaLabel="Previous">
                    ◀
                  </PageBtn>

                  {getPageWindow(safePage, totalPages, 5).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => gotoPage(p)}
                      aria-label={p.toString()}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-white text-gray-700 hover:bg-blue-50/40"
                    >
                      {p}
                    </button>
                  ))}

                  <PageBtn onClick={() => gotoPage(page + 1)} ariaLabel="Next">
                    ▶
                  </PageBtn>
                  <PageBtn onClick={() => gotoPage(totalPages)} ariaLabel="Last">
                    ⏭
                  </PageBtn>

                </div>
              </div>
            </div>
            <div></div>
          </section>
        </div>
      </div>
    </div>
  )
}

function PageBtn({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-white text-gray-700 hover:bg-blue-50/40"
    >
      {children}
    </button>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-extrabold tracking-wider text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">
        {value || "-"}
      </div>
    </div>
  );
}