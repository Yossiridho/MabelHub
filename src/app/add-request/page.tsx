'use client'

export default function AddRequestPage() {
  return (
    <div className="flex-1 p-6">
      <main className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <h2 className="text-2xl font-bold text-gray-900">Buat Request Baru</h2>
        <p className="mt-2 text-gray-600">Terima kasih telah menggunakan MabelHub. Halaman ini sedang dalam pengembangan.</p>
        
        <div className="mt-8 border-t pt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Satker</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Masukkan nama satuan kerja" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Visit</label>
              <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Keterangan</label>
            <textarea rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Detail aktivitas..." />
          </div>

          <div className="mt-8 flex justify-end">
            <button className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Simpan Request
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
