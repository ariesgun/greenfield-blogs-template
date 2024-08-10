import Link from "next/link";

const Header = () => {
  return (
    <>
      <header class="border-b border-gray-200 bg-sky-950">
        <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-8 lg:px-8">
          <div class="flex flex-col gap-4 items-center">
            <div className="mx-auto py-14">
              <h1 class="text-4xl font-bold text-slate-200">Blog Posts</h1>
            </div>

            <div className="flex flex-row gap-8 mx-auto">
              <Link href="/" class="text-xl font-semibold text-slate-200">
                Home
              </Link>
              <Link href="/about" class="text-xl font-semibold text-slate-200">
                About
              </Link>
            </div>

            {/* <div class="flex items-center gap-4">
              <button
                class="inline-flex items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-5 py-3 text-gray-900 transition hover:text-gray-700 focus:outline-none focus:ring"
                type="button"
              >
                <span class="text-base font-medium"> View Website </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            </div> */}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
