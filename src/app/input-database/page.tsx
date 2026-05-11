'use client'

import SearchableSelect from '@/components/ui/SearchableSelect'
import { useState, useEffect, Suspense } from 'react'
import { useSession } from '@/components/session/SessionProvider'
import { Building, Plus, Trash2, Save, Loader2, Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

type TeamMember = {
  userId: string
  fullName: string
  username: string
  role: string
}

type KontakItem = {
  id: string
  nama: string
  jabatan: string
  tipeKontak: string
  noTelp: string
  email: string
}

function displayName(m: {
  fullName?: string
  username?: string
  userId: string
  role?: string
}) {
  const name =
    (m.fullName || '').trim() || (m.username || '').trim() || m.userId
  return m.role ? `${name} • ${m.role}` : name
}

// ── Label field yang ditampilkan di history ─────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  requestor: 'Penginput',
  segmen: 'Jenis Entitas',
  namaPerusahaan: 'Nama Perusahaan',
  provinsi: 'Provinsi',
  kota: 'Kota/Kabupaten',
  alamat: 'Alamat',
  bidangPerusahaan: 'Bidang Usaha',
  segmentasi: 'Segmentasi',
  produkRelevan: 'Produk Relevan',
  merekTayang: 'Merek Tayang',
  brandOwner: 'Brand Owner',
  sumberData: 'Sumber Data',
  linkProduk: 'Link Produk',
  linkToko: 'Link Toko',
}

function computeChangedFields(
  oldSnap: { header: Record<string, string>; items: any[] } | null,
  newHeader: Record<string, string>,
  newItems: any[]
): { field: string; oldValue: string; newValue: string }[] {
  const changes: { field: string; oldValue: string; newValue: string }[] = []
  if (!oldSnap) return changes

  // Bandingkan setiap field header
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const oldVal = String(oldSnap.header[key] ?? '')
    const newVal = String(newHeader[key] ?? '')
    if (oldVal !== newVal) {
      changes.push({ field: label, oldValue: oldVal, newValue: newVal })
    }
  }

  // Bandingkan items kontak (per-index)
  const maxLen = Math.max(oldSnap.items.length, newItems.length)
  for (let i = 0; i < maxLen; i++) {
    const oldItem = oldSnap.items[i]
    const newItem = newItems[i]
    const prefix = `Kontak ${i + 1}`
    if (!oldItem && newItem) {
      changes.push({ field: `${prefix}`, oldValue: '(tidak ada)', newValue: `${newItem.nama} – ${newItem.jabatan}` })
      continue
    }
    if (oldItem && !newItem) {
      changes.push({ field: `${prefix}`, oldValue: `${oldItem.nama} – ${oldItem.jabatan}`, newValue: '(dihapus)' })
      continue
    }
    const kontakFields: { key: keyof typeof oldItem; label: string }[] = [
      { key: 'nama', label: 'Nama' },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'tipeKontak', label: 'Tipe Kontak' },
      { key: 'noTelp', label: 'No Kontak' },
      { key: 'email', label: 'Email' },
    ]
    for (const f of kontakFields) {
      const ov = String(oldItem[f.key] ?? '')
      const nv = String(newItem[f.key] ?? '')
      if (ov !== nv) {
        changes.push({ field: `${prefix} – ${f.label}`, oldValue: ov, newValue: nv })
      }
    }
  }

  return changes
}

function InputDatabaseContent() {
  const [codeInput, setcodeInput] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: sessionLoading } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  // Snapshot data asli saat form pertama kali di-load (untuk diff history)
  const [originalSnapshot, setOriginalSnapshot] = useState<{ header: Record<string, string>; items: any[] } | null>(null)
  // Auto-isi requestor dari session user yang sedang login
  useEffect(() => {
    if (user) {
      setRequestor(user.fullName.trim() || user.username.trim())
    }
  }, [user])

  // Auto-load data jika halaman dibuka dengan query param ?id=
  useEffect(() => {
    const idParam = searchParams.get('id')
    if (!idParam || !idParam.trim()) return

    const code = idParam.trim()
    setcodeInput(code)

    // Auto-fetch data dengan kode dari URL
    setIsLoading(true)
    fetch(`/api/input-database/${code}`)
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (!data) return

        const header = data?.header ?? data
        const kontakItems = data?.items ?? (Array.isArray(data) ? data : [])
        if (kontakItems.length > 0) setItems(kontakItems)

        setRequestor(header?.requestor ?? '')
        setSegmen(header?.segmen ?? '')
        setNamaPerusahaan(header?.namaPerusahaan ?? '')
        setProvinsi(header?.provinsi ?? '')
        setKota(header?.kota ?? '')
        setAlamat(header?.alamat ?? '')
        setBidangPerusahaan(header?.bidangPerusahaan ?? '')
        setSegmentasi(header?.segmentasi ?? '')
        setProdukRelevan(header?.produkRelevan ?? '')
        setMerekTayang(header?.merekTayang ?? '')
        setBrandOwner(header?.brandOwner ?? '')
        setSumberData(header?.sumberData ?? '')
        setLinkProduk(header?.linkProduk ?? '')
        setLinkToko(header?.linkToko ?? '')

        // ── Simpan snapshot asli untuk diff history ──────────────────────
        setOriginalSnapshot({
          header: {
            requestor: header?.requestor ?? '',
            segmen: header?.segmen ?? '',
            namaPerusahaan: header?.namaPerusahaan ?? '',
            provinsi: header?.provinsi ?? '',
            kota: header?.kota ?? '',
            alamat: header?.alamat ?? '',
            bidangPerusahaan: header?.bidangPerusahaan ?? '',
            segmentasi: header?.segmentasi ?? '',
            produkRelevan: header?.produkRelevan ?? '',
            merekTayang: header?.merekTayang ?? '',
            brandOwner: header?.brandOwner ?? '',
            sumberData: header?.sumberData ?? '',
            linkProduk: header?.linkProduk ?? '',
            linkToko: header?.linkToko ?? '',
          },
          items: kontakItems,
        })
      })
      .catch(() => { /* silent fail */ })
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  const canPickAssignee =
    user?.role === 'LEADER' ||
    user?.role === 'SUPERADMIN' ||
    user?.role === 'ADMIN'
  const [assigneeOptions, setAssigneeOptions] = useState<TeamMember[]>([])
  const [assignedToUserId, setAssignedToUserId] = useState('')
  const [requestor, setRequestor] = useState('')

  const handleGenerate = async () => {
    // Prefix = 3 huruf pertama nama user, uppercase (misal "Aliya" → "ALY")
    const namaUser = user?.fullName?.trim() || user?.username?.trim() || ''
    const prefix = namaUser.substring(0, 4).toUpperCase() || 'XXX'

    const date = new Date()
    // Format DDMMYY
    const dmy = date
      .toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
      .replace(/\//g, '')

    // Fetch counter berikutnya dari database (0001, 0002, dst.)
    let counter = '0001'
    try {
      const res = await fetch(`/api/input-database?prefix=${prefix}&dmy=${dmy}`)
      if (res.ok) {
        const data = await res.json()
        counter = data.counter || '0001'
      }
    } catch {
      // fallback ke 0001 jika gagal
    }

    setcodeInput(`${prefix}-${dmy}-${counter}`)

    // Isi juga field PENGINPUT dengan nama user yang sedang login
    if (namaUser) setRequestor(namaUser)
  }
  const [segmen, setSegmen] = useState<string>('')
  const [kota, setKota] = useState<string>('')
  const [alamat, setAlamat] = useState('')
  const [namaPerusahaan, setNamaPerusahaan] = useState('')
  const [provinsi, setProvinsi] = useState('')

  const [bidangPerusahaan, setBidangPerusahaan] = useState('')
  const [segmentasi, setSegmentasi] = useState('')
  const [produkRelevan, setProdukRelevan] = useState('')
  const [merekTayang, setMerekTayang] = useState('')
  const [brandOwner, setBrandOwner] = useState('')
  const [sumberData, setSumberData] = useState('')
  const [linkProduk, setLinkProduk] = useState('')
  const [linkToko, setLinkToko] = useState('')

  const [options, setOptions] = useState<{

    nama: string[]
    jabatan: string[]
    tipeKontak: string[]
    noTelp: string[]
    email: string[]
    bidangPerusahaan: string[]
    segmentasi: string[]
    produkRelevan: string[]
    merekTayang: string[]
    brandOwner: string[]
    sumberData: string[]
    linkProduk: string[]
    linkToko: string[]
  }>({
    nama: [],
    jabatan: [],
    tipeKontak: [],
    noTelp: [],
    email: [],
    bidangPerusahaan: [],
    segmentasi: [],
    produkRelevan: [],
    merekTayang: [],
    brandOwner: [],
    sumberData: [],
    linkProduk: [],
    linkToko: [],
  })

  const [items, setItems] = useState<
    {
      id: string
      nama: string
      jabatan: string
      tipeKontak: string
      noTelp: string
      email: string
    }[]
  >([
    {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      nama: '',
      jabatan: '',
      tipeKontak: '',
      noTelp: '',
      email: '',
    },
  ])

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        nama: '',
        jabatan: '',
        tipeKontak: '',
        noTelp: '',
        email: '',
      },
    ])
  }

  const [rows, setRows] = useState<string[][]>([]);
  const newKontak: KontakItem[] = rows
    .map((row, index) => ({
      id: String(Date.now() + index),
      nama: row[0] ? String(row[0]).trim() : "",
      jabatan: row[1] ? String(row[1]).trim() : "",
      tipeKontak: row[2] ? String(row[2]).trim() : "",
      noTelp: row[3] ? String(row[3]).trim() : "",
      email: row[4] ? String(row[4]).trim() : "",
    }))



  const updateItem = (index: number, field: string, value: string) => {
    setItems((prev) => {
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], [field]: value }
      return newItems
    })
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleCariKode = async () => {
    try {
      if (!codeInput.trim()) {
        alert('Masukkan kode terlebih dahulu')
        return
      }
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const res = await fetch(`/api/input-database/${codeInput}`)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        alert(errData?.error || 'Data tidak ditemukan untuk kode tersebut')
        return
      }

      const data = await res.json()
      console.log('Data ditemukan:', data)

      if (!data || (Array.isArray(data) && data.length === 0)) {
        alert('Data tidak ditemukan')
        return
      }

      // Support both response shapes: { header, items } or raw array
      const header = data?.header ?? data
      const kontakItems = data?.items ?? (Array.isArray(data) ? data : [])

      if (kontakItems.length > 0) {
        setItems(kontakItems)
      }
      setRequestor(header?.requestor ?? user?.fullName ?? user?.username ?? user?.userId ?? '')
      setSegmen(header?.segmen ?? '')
      setNamaPerusahaan(header?.namaPerusahaan ?? '')
      setProvinsi(header?.provinsi ?? '')
      setKota(header?.kota ?? '')
      setAlamat(header?.alamat ?? '')
      setBidangPerusahaan(header?.bidangPerusahaan ?? '')
      setSegmentasi(header?.segmentasi ?? '')
      setProdukRelevan(header?.produkRelevan ?? '')
      setMerekTayang(header?.merekTayang ?? '')
      setBrandOwner(header?.brandOwner ?? '')
      setSumberData(header?.sumberData ?? '')
      setLinkProduk(header?.linkProduk ?? '')
      setLinkToko(header?.linkToko ?? '')

      // ── Simpan snapshot asli untuk diff history ──────────────────────
      setOriginalSnapshot({
        header: {
          requestor: header?.requestor ?? '',
          segmen: header?.segmen ?? '',
          namaPerusahaan: header?.namaPerusahaan ?? '',
          provinsi: header?.provinsi ?? '',
          kota: header?.kota ?? '',
          alamat: header?.alamat ?? '',
          bidangPerusahaan: header?.bidangPerusahaan ?? '',
          segmentasi: header?.segmentasi ?? '',
          produkRelevan: header?.produkRelevan ?? '',
          merekTayang: header?.merekTayang ?? '',
          brandOwner: header?.brandOwner ?? '',
          sumberData: header?.sumberData ?? '',
          linkProduk: header?.linkProduk ?? '',
          linkToko: header?.linkToko ?? '',
        },
        items: kontakItems,
      })
    } catch (error) {
      console.error('Error mencari kode:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat mengambil data'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKirim = async () => {
    try {
      const isRevisionMode = !!(searchParams.get('id')?.trim() || originalSnapshot)

      // Gunakan kode yang sudah di-generate manual; fallback auto-generate jika masih kosong
      const namaReq = requestor.trim() || user?.fullName?.trim() || user?.username?.trim() || ''
      const prefixFallback = namaReq.substring(0, 3).toUpperCase() || 'XXX'
      const date = new Date()
      const dmy = date
        .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })
        .replace(/\//g, '')
      const generatedCode = codeInput.trim() || `${prefixFallback}-${dmy}-${String(Date.now()).slice(-4)}`

      const headerPayload = {
        codeInput: generatedCode,
        requestor: requestor || user?.fullName || user?.username || user?.userId || '',
        assignedToUserId: assignedToUserId || user?.userId || '',
        segmen: segmen,
        namaPerusahaan: namaPerusahaan,
        provinsi: provinsi,
        kota: kota,
        alamat: alamat,
        bidangPerusahaan: bidangPerusahaan,
        segmentasi: segmentasi,
        produkRelevan: produkRelevan,
        merekTayang: merekTayang,
        brandOwner: brandOwner,
        sumberData: sumberData,
        linkProduk: linkProduk,
        linkToko: linkToko,
      }

      const itemsPayload = items.map((item) => ({
        id: item.id,
        nama: item.nama,
        jabatan: item.jabatan,
        tipeKontak: item.tipeKontak,
        noTelp: item.noTelp,
        email: item.email,
      }))

      let res: Response

      if (isRevisionMode) {
        // ── Hitung perubahan field ────────────────────────────────────
        const changedFields = computeChangedFields(
          originalSnapshot,
          headerPayload,
          itemsPayload
        )

        // ── Mode REVISI: panggil PUT ─────────────────────────────────
        res = await fetch('/api/input-database', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: generatedCode,
            header: headerPayload,
            items: itemsPayload,
            oldData: originalSnapshot,      // snapshot sebelum revisi
            changedFields,                  // daftar field yang berubah
            revisedBy: requestor || user?.fullName || user?.username || '',
          }),
        })
      } else {
        // ── Mode BARU: panggil POST ───────────────────────────────────────
        res = await fetch('/api/input-database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ header: headerPayload, items: itemsPayload }),
        })
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error || 'Gagal menyimpan database')
      }

      alert(isRevisionMode ? 'Data berhasil direvisi!' : 'Database berhasil disimpan!')
      router.push('/input-database')
      router.refresh()
    } catch (error) {
      console.error('Error saving database:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan database',
      )
    }
  }


  return (
    <div className='min-h-screen bg-blue-50'>
      <div className='flex'>
        <div className='flex-1 p-6 '>
          <div className='bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100'>
            <div className='flex flex-col'>
              <h1 className='text-3xl pl-4 font-extrabold text-black drop-shadow-sm'>
                Database System
              </h1>
              <div className='text-sm ml-4 mt-2 text-slate-500 font-medium'>
                Form Input/Revisi Database
              </div>
            </div>
          </div>
          <section className='mt-2 rounded-2xl bg-white p-4 pl-7 h-24 shadow-sm ring-1 ring-black/5'>
            <div className='flex items-center justify-between gap-3 mb-6'>
              <div className='flex flex-col'>
                <h2 className='text-xl pl-1 font-bold text-gray-700'>
                  Cari Kode Untuk Revisi
                </h2>
                <input
                  className='h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                  placeholder='Masukkan Kode'
                  value={codeInput}
                  onChange={(e) => setcodeInput(e.target.value)}
                />
              </div>
              <button
                onClick={handleCariKode}
                disabled={isLoading}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'Cari Kode'}
              </button>
            </div>
          </section>

          <section className='mt-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5'>
            <div className='flex items-center gap-3 mb-6'>
              <Building
                className='text-white bg-blue-600 rounded-2xl p-1 px-2'
                size={38}
              />
              <div className='flex flex-col'>
                <h2 className='text-xl font-bold text-gray-700'>
                  Informasi Entitas
                </h2>
                <p className='text-sm font-medium text-gray-500'>
                  Data Perusahaan atau Organisasi
                </p>
              </div>
            </div>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  PENGINPUT
                </label>
                <div className='mt-2'>
                  <SearchableSelect
                    value={requestor}
                    onChange={(val: string) => setRequestor(val)}
                    options={(() => {
                      const base = [
                        { value: '', label: 'Pilih requestor' },
                        { value: 'Aliya', label: 'Aliya' },
                      ]
                      // Jika requestor dari database belum ada di list, tambahkan otomatis
                      if (requestor && !base.find((o) => o.value === requestor)) {
                        base.push({ value: requestor, label: requestor })
                      }
                      return base
                    })()}
                    className='w-full'
                    placeholder='Pilih requestor...'
                  />
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
                      { value: '', label: '-- Pilih --' },
                      { value: 'PT', label: 'PT' },
                      { value: 'CV', label: 'CV' },
                      { value: 'BLUD', label: 'BLUD' },
                      { value: 'Pendidikan', label: 'Pendidikan' },
                      { value: 'RS', label: 'RS' },
                      { value: 'BUMN', label: 'BUMN' },
                      { value: 'Tidak Diketahui', label: 'Tidak Diketahui' },
                    ]}
                    className='border-0 bg-white'
                    placeholder='Pilih Jenis Entitas...'
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
                  placeholder='Ketik Nama Perusahaan...'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                />
              </div>

              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  PROVINSI
                </label>
                <SearchableSelect
                  value={provinsi}
                  onChange={(val: string) => setProvinsi(val)}
                  options={[
                    { value: '', label: '-- Pilih --' },
                    { value: 'Aceh', label: 'Aceh' },
                    { value: 'Sumatera Utara', label: 'Sumatera Utara' },
                    { value: 'Sumatera Barat', label: 'Sumatera Barat' },
                    { value: 'Riau', label: 'Riau' },
                    { value: 'Jambi', label: 'Jambi' },
                    { value: 'Sumatera Selatan', label: 'Sumatera Selatan' },
                    { value: 'Bengkulu', label: 'Bengkulu' },
                    { value: 'Lampung', label: 'Lampung' },
                    {
                      value: 'Kepulauan Bangka Belitung',
                      label: 'Kepulauan Bangka Belitung',
                    },
                    { value: 'Kepulauan Riau', label: 'Kepulauan Riau' },
                    { value: 'DKI Jakarta', label: 'DKI Jakarta' },
                    { value: 'Jawa Barat', label: 'Jawa Barat' },
                    { value: 'Jawa Tengah', label: 'Jawa Tengah' },
                    { value: 'DI Yogyakarta', label: 'DI Yogyakarta' },
                    { value: 'Jawa Timur', label: 'Jawa Timur' },
                    { value: 'Banten', label: 'Banten' },
                    { value: 'Bali', label: 'Bali' },
                    {
                      value: 'Nusa Tenggara Barat',
                      label: 'Nusa Tenggara Barat',
                    },
                    {
                      value: 'Nusa Tenggara Timur',
                      label: 'Nusa Tenggara Timur',
                    },
                    { value: 'Kalimantan Barat', label: 'Kalimantan Barat' },
                    { value: 'Kalimantan Tengah', label: 'Kalimantan Tengah' },
                    {
                      value: 'Kalimantan Selatan',
                      label: 'Kalimantan Selatan',
                    },
                    { value: 'Kalimantan Timur', label: 'Kalimantan Timur' },
                    { value: 'Kalimantan Utara', label: 'Kalimantan Utara' },
                    { value: 'Sulawesi Utara', label: 'Sulawesi Utara' },
                    { value: 'Sulawesi Tengah', label: 'Sulawesi Tengah' },
                    { value: 'Sulawesi Selatan', label: 'Sulawesi Selatan' },
                    { value: 'Sulawesi Tenggara', label: 'Sulawesi Tenggara' },
                    { value: 'Gorontalo', label: 'Gorontalo' },
                    { value: 'Sulawesi Barat', label: 'Sulawesi Barat' },
                    { value: 'Maluku', label: 'Maluku' },
                    { value: 'Maluku Utara', label: 'Maluku Utara' },
                    { value: 'Papua', label: 'Papua' },
                    { value: 'Papua Barat', label: 'Papua Barat' },
                    { value: 'Papua Selatan', label: 'Papua Selatan' },
                    { value: 'Papua Tengah', label: 'Papua Tengah' },
                    { value: 'Papua Pegunungan', label: 'Papua Pegunungan' },
                    { value: 'Papua Barat Daya', label: 'Papua Barat Daya' },
                  ]}
                  className='border-0 bg-white'
                  placeholder='Pilih Provinsi...'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  KOTA/KABUPATEN
                </label>
                <SearchableSelect
                  value={kota}
                  onChange={(val: string) => setKota(val)}
                  isDisabled={!provinsi}
                  options={[
                    { value: '', label: '-- Pilih --' },
                    { value: 'Kota Bandung', label: 'Kota Bandung' },
                    { value: 'Kota Cimahi', label: 'Kota Cimahi' },
                    { value: 'Kabupaten Bandung', label: 'Kabupaten Bandung' },
                    { value: 'Kabupaten Bandung Barat', label: 'Kabupaten Bandung Barat' },
                    { value: 'Kabupaten Sumedang', label: 'Kabupaten Sumedang' },
                    { value: 'Kabupaten Garut', label: 'Kabupaten Garut' },
                    { value: 'Kabupaten Tasikmalaya', label: 'Kabupaten Tasikmalaya' },
                    { value: 'Kabupaten Ciamis', label: 'Kabupaten Ciamis' },
                    { value: 'Kabupaten Cianjur', label: 'Kabupaten Cianjur' },
                    {
                      value: 'Kabupaten Karawang',
                      label: 'Kabupaten Karawang',
                    },
                    { value: 'Kabupaten Bekasi', label: 'Kabupaten Bekasi' },
                    { value: 'Kota Depok', label: 'Kota Depok' },
                    { value: 'Kota Bekasi', label: 'Kota Bekasi' },
                    { value: 'Kota Bogor', label: 'Kota Bogor' },
                    { value: 'Kota Depok', label: 'Kota Depok' },
                    { value: 'Kota Tasikmalaya', label: 'Kota Tasikmalaya' },
                    { value: 'Kabupaten Purwakarta', label: 'Kabupaten Purwakarta' },
                    {
                      value: 'Kabupaten Subang',
                      label: 'Kabupaten Subang',
                    },
                    {
                      value: 'Kabupaten Indramayu',
                      label: 'Kabupaten Indramayu',
                    },
                    { value: 'Kabupaten Kuningan', label: 'Kabupaten Kuningan' },
                    { value: 'Kabupaten Majalengka', label: 'Kabupaten Majalengka' },
                    {
                      value: 'Kabupaten Cirebon',
                      label: 'Kabupaten Cirebon',
                    },
                    { value: 'Kota Cirebon', label: 'Kota Cirebon' },
                    { value: 'Kabupaten Sukabumi', label: 'Kabupaten Sukabumi' },
                    { value: 'Kota Sukabumi', label: 'Kota Sukabumi' },
                    { value: 'Kabupaten Sukabumi', label: 'Kabupaten Sukabumi' },
                    { value: 'Kabupaten Sukabumi', label: 'Kabupaten Sukabumi' },
                    { value: 'Kabupaten Sukabumi', label: 'Kabupaten Sukabumi' },
                    { value: 'Kabupaten Sukabumi', label: 'Kabupaten Sukabumi' },
                    { value: 'Kabupaten Sukabumi', label: 'Kabupaten Sukabumi' },
                    { value: 'Kabupaten Serang', label: 'Kabupaten Serang' },
                    { value: 'Kabupaten Tangerang', label: 'Kabupaten Tangerang' },
                    { value: 'Kabupaten Lebak', label: 'Kabupaten Lebak' },
                    { value: 'Kabupaten Pandeglang', label: 'Kabupaten Pandeglang' },
                    { value: 'Kabupaten Serang', label: 'Kabupaten Serang' },
                    { value: 'Kabupaten Tangerang', label: 'Kabupaten Tangerang' },
                    { value: 'Kabupaten Lebak', label: 'Kabupaten Lebak' },
                    { value: 'Kabupaten Pandeglang', label: 'Kabupaten Pandeglang' },
                    { value: 'Kabupaten Sukabumi', label: 'Kabupaten Sukabumi' },
                    { value: 'Kabupaten Sukabumi', label: 'Kabupaten Sukabumi' },
                  ]}
                  className='border-0 bg-white'
                  placeholder='Pilih Kota/Kabupaten...'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  ALAMAT
                </label>
                <input
                  type='text'
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder='Jalan Contoh No. 123'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                />
              </div>
            </div>
          </section>
          <section className='mt-6 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5'>
            <div className='flex items-center justify-between gap-4 mb-6'>
              <div>
                <h2 className='text-xl font-bold text-gray-800'>
                  Informasi Kontak
                </h2>
                <p className='text-sm font-medium text-gray-500'>
                  Data kontak person perusahaan
                </p>
              </div>
              <button
                onClick={addItem}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='w-4 h-4' />{' '}
                <p className='text-xs font-semibold'>Tambah Kontak</p>
              </button>
            </div>
            <div className='flex flex-col gap-4'>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className='relative grid grid-cols-1 gap-3 md:grid-cols-5 p-4 border border-gray-100 rounded-xl bg-gray-50/50'
                >

                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className='absolute -top-2 -right-2 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors z-10 shadow-sm'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  )}
                  <div>
                    <label className='text-sm font-semibold text-blue-600'>
                      NAMA LENGKAP
                    </label>
                    <input
                      type='text'
                      value={item.nama}
                      onChange={(e) => updateItem(index, 'nama', e.target.value)}
                      placeholder='Masukkan Nama'
                      className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-semibold text-blue-600'>
                      JABATAN
                    </label>
                    <input
                      type='text'
                      value={item.jabatan}
                      onChange={(e) => updateItem(index, 'jabatan', e.target.value)}
                      placeholder='Masukkan Jabatan'
                      className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-semibold text-blue-600'>
                      TIPE KONTAK
                    </label>
                    <SearchableSelect
                      value={item.tipeKontak}
                      onChange={(value) => updateItem(index, 'tipeKontak', value as string)}
                      options={(() => {
                        const base = [
                          { value: '', label: '-Pilih-' },
                          { value: 'WhatsApp', label: 'WhatsApp' },
                          { value: 'Office', label: 'TELP' },
                          { value: 'Phone Call', label: 'SMS' },
                        ]
                       if (item.tipeKontak && !base.find((o) => o.value === item.tipeKontak)) {
                         base.push({ value : item.tipeKontak, label : item.tipeKontak})
                       }
                       return base;
                      })()}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-semibold text-blue-600'>
                      NO KONTAK
                    </label>
                    <input
                      type='text'
                      value={item.noTelp}
                      onChange={(e) => updateItem(index, 'noTelp', e.target.value)}
                      placeholder='6281234567890'
                      className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-semibold text-blue-600'>
                      EMAIL
                    </label>
                    <input
                      type='text'
                      value={item.email}
                      onChange={(e) => updateItem(index, 'email', e.target.value)}
                      placeholder='email@example.com'
                      className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className='mt-6 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5'>
            <div className='flex items-center justify-between gap-4 mb-6'>
              <div>
                <h2 className='text-xl font-bold text-gray-800'>
                  Sumber Data & Produk
                </h2>
                <p className='text-sm font-medium text-gray-500'>
                  Informasi sumber data dan produk yang relevan
                </p>
              </div>
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-5'>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  BIDANG USAHA
                </label>
                <select
                  value={bidangPerusahaan}
                  onChange={(e) => setBidangPerusahaan(e.target.value)}
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                >
                  <option className='text-gray-600' value=''>
                    Pilih Sumber Data
                  </option>
                  <option value="Energi & Pertambangan">Energi & Pertambangan</option>
                  <option value="Jasa Profesional">Jasa Profesional</option>
                  <option value="Jasa Umum & Lainnya">Jasa Umum & Lainnya</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Keuangan & Asuransi">Keuangan & Asuransi</option>
                  <option value="Konstruksi & Properti">Konstruksi & Properti</option>
                  <option value="Kreatif & Media">Kreatif & Media</option>
                  <option value="Manufaktur & Industri">Manufaktur & Industri</option>
                  <option value="Pemerintahan & BUMN">Pemerintahan & BUMN</option>
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Perdagangan (Trading)">Perdagangan (Trading)</option>
                  <option value="Perhotelan & Pariwisata">Perhotelan & Pariwisata</option>
                  <option value="Pertanian, Perkebunan & Perikanan">Pertanian, Perkebunan & Perikanan</option>
                  <option value="Teknologi & Digital">Teknologi & Digital</option>
                  <option value="UMKM & Industri Rumah Tangga">UMKM & Industri Rumah Tangga</option>
                </select>
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  SEGMENTASI
                </label>
                <select
                  value={segmentasi}
                  onChange={(e) => setSegmentasi(e.target.value)}
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                >
                  <option className='text-gray-600' value=''>
                    Pilih Segmentasi
                  </option>
                  <option value="B2G-R1">B2G-R1</option>
                  <option value="B2G-R2">B2G-R2</option>
                  <option value="B2G-R3">B2G-R3</option>
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                  <option value="C2C">C2C</option>
                  <option value="C2B">C2B</option>
                </select>
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  PRODUK RELEVAN
                </label>
                <SearchableSelect
                  value={produkRelevan}
                  onChange={(value) => setProdukRelevan(value)}
                  options={(() => {
                    const base = [
                      { value: '', label: 'Pilih Produk Relevan' },
                      { value: 'IFP', label: 'IFP' },
                      { value: 'MRS', label: 'MRS' },
                      { value: 'VIDEOTRON', label: 'VIDEOTRON' },
                      { value: 'AIO', label: 'AIO' },
                    ]
                    if (produkRelevan && !base.find((o) => o.value === produkRelevan)) {
                      base.push({ value: produkRelevan, label: produkRelevan })
                    }
                    return base
                  })()}
                  className='w-full'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  MEREK TAYANG
                </label>
                <SearchableSelect
                  value={merekTayang}
                  onChange={(value) => setMerekTayang(value)}
                  options={(() => {
                    const base = [
                      { value: '', label: 'Pilih Merek Tayang' },
                      { value: 'HDe', label: 'HDe' },
                      { value: 'MABO POWER', label: 'MABO POWER' },
                      { value: 'MOBO POWER', label: 'MOBO POWER' },
                      { value: 'Lainnya', label: 'Lainnya' },
                    ]
                    if (merekTayang && !base.find((o) => o.value === merekTayang)) {
                      base.push({ value: merekTayang, label: merekTayang })
                    }
                    return base
                  })()}
                  className='w-full'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  BRAND OWNER
                </label>
                <SearchableSelect
                  value={brandOwner}
                  onChange={(value) => setBrandOwner(value)}
                  options={(() => {
                    const base = [
                      { value: '', label: 'Pilih Brand Owner' },
                      { value: 'YA', label: 'YA' },
                      { value: 'TIDAK', label: 'TIDAK' },
                    ]
                    if (brandOwner && !base.find((o) => o.value === brandOwner)) {
                      base.push({ value: brandOwner, label: brandOwner })
                    }
                    return base
                  })()}
                  className='w-full'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3 mt-6'>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  SUMBER DATA
                </label>
                <SearchableSelect
                  value={sumberData}
                  onChange={(value) => setSumberData(value)}
                  options={(() => {
                    const base = [
                      { value: '', label: 'Pilih Sumber Data' },
                      { value: 'e-Katalog LKPP', label: 'e-Katalog LKPP' },
                      { value: 'INAPROC', label: 'INAPROC' },
                      { value: 'PaDi UMKM', label: 'PaDi UMKM' },
                      { value: 'Mbizmarket', label: 'Mbizmarket' },
                      { value: 'SIPLah', label: 'SIPLah' },
                      { value: 'SPSE Pemda', label: 'SPSE Pemda' },
                      { value: 'Sistem Internal Instansi', label: 'Sistem Internal Instansi' },
                    ]
                    if (sumberData && !base.find((o) => o.value === sumberData)) {
                      base.push({ value: sumberData, label: sumberData })
                    }
                    return base
                  })()}
                  className='w-full'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  LINK PRODUK
                </label>
                <input
                  type='text'
                  value={linkProduk}
                  onChange={(e) => setLinkProduk(e.target.value)}
                  placeholder='https:// atau contoh.com'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  LINK TOKO
                </label>
                <input
                  type='text'
                  value={linkToko}
                  onChange={(e) => setLinkToko(e.target.value)}
                  placeholder='https:// atau contoh.com'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                />
              </div>
            </div>
          </section>
          <div className='mt-6'>
            <div className='flex items-center justify-center gap-4 mb-6'>
              <button
                onClick={handleKirim}
                className='flex h-10 items-center justify-center gap-2 cursor-pointer rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm ring-1 ring-inset ring-blue-700 hover:bg-blue-700 transition-all'
              >
                <Save className='w-5 h-5' />
                {searchParams.get('id') ? 'Simpan Revisi' : 'Simpan Database'}
              </button>
            </div>
          </div>
        </div>
      </div >
    </div >
  )
}

export default function InputDatabasePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-blue-50 grid place-items-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <InputDatabaseContent />
    </Suspense>
  )
}
