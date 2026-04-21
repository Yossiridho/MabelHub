'use client'

import SearchableSelect from '@/components/ui/SearchableSelect'
import { useState, useEffect } from 'react'
import { useSession } from '@/components/session/SessionProvider'
import { Building, Plus, Trash2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

export default function InputDatabasePage() {
  const [codeInput, setcodeInput] = useState('')
  const handleGenerate = () => {
    const prefix = "D" + user?.role.substring(0, 2)
    const date = new Date();

    // Format DDMMYY
    const dmy = date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).replace(/\//g, '');

    const counter = "0001";

    setcodeInput(`${prefix}-${dmy}-${counter}`);
  }
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  // Auto-isi requestor dari session user yang sedang login
  useEffect(() => {
    if (user) {
      // Isi requestor dengan nama lengkap user yang login
      setRequestor(user.fullName.trim() || user.username.trim())
    }
  }, [user])
  const canPickAssignee =
    user?.role === 'LEADER' ||
    user?.role === 'SUPERADMIN' ||
    user?.role === 'ADMIN'
  const [assigneeOptions, setAssigneeOptions] = useState<TeamMember[]>([])
  const [assignedToUserId, setAssignedToUserId] = useState('')
  const [requestor, setRequestor] = useState('')
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
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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

  const handleKirim = async () => {
    try {
      // Generate ticket code sinkron sebelum payload dibuat
      const prefix = 'D' + (user?.role?.substring(0, 2) ?? 'XX')
      const date = new Date()
      const dmy = date
        .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })
        .replace(/\//g, '')
      const generatedCode = `${prefix}-${dmy}-${String(Date.now()).slice(-4)}`
      setcodeInput(generatedCode)

      const payload = {
        header: {
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
        },
        // maping untuk insert to Array ke database
        items: items.map((item) => ({
          id: item.id,
          nama: item.nama,
          jabatan: item.jabatan,
          tipeKontak: item.tipeKontak,
          noTelp: item.noTelp,
          email: item.email,
        })),
      }

      const res = await fetch('/api/input-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error || 'Gagal menyimpan database')
      }

      alert('Database berhasil disimpan!')
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
            <div className='flex items-center gap-3 mb-6'>
              <div className='flex flex-col'>
                <h2 className='text-xl pl-1 font-bold text-gray-700'>
                  Cari Kode Untuk Revisi
                </h2>
                <input
                  className='h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                  placeholder='Masukkan Kode'
                />
              </div>
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

                <div className='relative mt-2'>
                  {canPickAssignee ? (
                    <SearchableSelect
                      value={assignedToUserId}
                      onChange={(val: string) => setAssignedToUserId(val)}
                      options={[
                        { value: user?.userId, label: displayName(user) },
                        { value: 'Ramadan', label: 'Ramadan'},
                        { value: '', label: 'Isi Sendiri'},                        ...assigneeOptions.map((m) => ({
                          value: m.userId,
                          label: displayName(m),
                        })),
                      ]}
                      className='border-0 bg-white'
                      placeholder='Pilih Assignee...'
                    />
                  ) : (
                    // SALES: requestor tampil auto (boleh edit manual kalau mau)
                    <input
                      value={requestor}
                      onChange={(e) => setRequestor(e.target.value)}
                      className='h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                      placeholder='Nama requestor'
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
                    <select
                      value={item.tipeKontak}
                      onChange={(e) => updateItem(index, 'tipeKontak', e.target.value)}
                      className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                    >
                      <option className='text-gray-600' value=''>
                        Pilih...
                      </option>
                      <option value='Whatsapp'>Whatsapp</option>
                      <option value='Office'>Office</option>
                      <option value='Phone Call'>Phone Call</option>
                    </select>
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
                <option value="Energi & Pertambangan">FMCG</option>
                <option value="Jasa Profesional">Ritel Makanan Minuman</option>
                <option value="Jasa Umum & Lainnya">Elektronik</option>
                <option value="Kesehatan">Pakaian & Aksesori</option>
                <option value="Keuangan & Asuransi">Rumah & Furnitur</option>
                <option value="Konstruksi & Properti">Otomotif</option>
                <option value="Kreatif & Media">Kesehatan & Kecantikan</option>
                <option value="Manufaktur & Industri">Mainan & Hobi</option>
                <option value="Pemerintahan & BUMN">Lainnya</option>
                <option value="Pendidikan">Lainnya</option>
                <option value="Perdagangan (Trading)">Lainnya</option>
                <option value="Perhotelan & Pariwisata">Lainnya</option>
                <option value="Pertanian, Perkebunan & Perikanan">Lainnya</option>
                <option value="Teknologi & Digital">Lainnya</option>
                <option value="UMKM & Industri Rumah Tangga">Lainnya</option>
                </select>
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  SEGMENTASI
                </label>
                <input
                  type='text'
                  value={segmentasi}
                  onChange={(e) => setSegmentasi(e.target.value)}
                  placeholder='Masukkan Segmentasi'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  PRODUK RELEVAN
                </label>
                <input
                  type='text'
                  value={produkRelevan}
                  onChange={(e) => setProdukRelevan(e.target.value)}
                  placeholder='Masukkan Produk Relevan'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  MEREK TAYANG
                </label>
                <input
                  type='text'
                  value={merekTayang}
                  onChange={(e) => setMerekTayang(e.target.value)}
                  placeholder='Masukkan Merek Tayang'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  BRAND OWNER
                </label>
                <input
                  type='text'
                  value={brandOwner}
                  onChange={(e) => setBrandOwner(e.target.value)}
                  placeholder='Masukkan Brand Owner'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3 mt-6'>
              <div>
                <label className='text-sm font-semibold text-blue-600'>
                  SUMBER DATA
                </label>
                <input
                  type='text'
                  value={sumberData}
                  onChange={(e) => setSumberData(e.target.value)}
                  placeholder='Masukkan Sumber Data'
                  className='mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-200'
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
                  placeholder='Masukkan Link Produk'
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
                  placeholder='Masukkan Link Toko'
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
                Simpan Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
