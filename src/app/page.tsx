import Image from "next/image";
export default function LoginPage(){

  return (
     <div className="flex min-h-screen items-center justify-center bg-blue-100">
       <div className="flex w-225 rounded-3xl bg-white p-10 shadow-lg border-l-8 border-blue-500">
         
         {/* LEFT SECTION */}
         <div className="flex w-1/2 flex-col items-center justify-center">
           <Image
             src="/logo.png"
             alt="MabelHub Logo"
             width={200}
             height={160}
             className="mt-7"
           />
           <h1 className="text-2xl font-semibold text-black">
             MabelHub
           </h1>
         </div>

        {/* RIGHT SECTION */}
        <div className="flex w-1/2 flex-col justify-center px-10">
         <h2 className="mb-8 text-center text-3xl font-semibold">
  LOGIN
</h2>

          <div className="mb-5">
            <label className="mb-2 block text-sm">Username</label>
            <input
              type="text"
              className="h-10 w-full rounded-lg bg-white px-3 text-sm border border-blue-300"
              placeholder="Enter username"
            />
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              className="h-10 w-full rounded-lg bg-white px-3 text-sm border border-blue-300"
              placeholder="Enter password"
            />
          </div>

<button className="h-11 rounded-full bg-blue-600 text-sm text-white transition hover:bg-blue-700">
            LOGIN
          </button>
        </div>

      </div>
    </div>
  );
}
