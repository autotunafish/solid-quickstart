import { Suspense, type Component, createSignal } from 'solid-js';
import { A, useLocation, useNavigate } from '@solidjs/router';

const App: Component = (props: { children: Element }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = createSignal('');

  const handleSearch = (e: Event) => {
    e.preventDefault();
    const query = searchQuery().trim();

    // Check if input is a positive integer (block height)
    if (/^\d+$/.test(query) && parseInt(query, 10) >= 0) {
      navigate(`/block/${query}`);
      setSearchQuery('');
      return;
    }

    // Check if input is a block hash (64-character hexadecimal string)
    if (/^[0-9a-fA-F]{64}$/.test(query)) {
      navigate(`/block/${query}`);
      setSearchQuery('');
      return;
    }
  };

  return (
    <div>
      <nav class="bg-slate-100 text-slate-900 px-4">
        <ul class="flex items-center">
          <li class="py-2 px-4">
            <A href="/" class="no-underline hover:underline">
              Home
            </A>
          </li>
          <li class="py-2 px-4">
            <A href="/blockchain" class="no-underline hover:underline">
              Blockchain
            </A>
          </li>
          <li class="py-2 px-4">
            <A href="/about" class="no-underline hover:underline">
              About
            </A>
          </li>
          <li class="py-2 px-4">
            <A href="/error" class="no-underline hover:underline">
              Error
            </A>
          </li>

          <li class="text-sm flex items-center space-x-1 ml-auto">
            <span>URL:</span>
            <input
              class="w-75px p-1 bg-white text-sm rounded-lg"
              type="text"
              readOnly
              value={location.pathname}
            />
          </li>

          <li class="py-2 px-4">
            <form onSubmit={handleSearch} class="flex items-center">
              <input
                type="text"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Block height or hash..."
                class="p-2 text-sm rounded-l-lg border border-slate-300 focus:outline-none focus:border-amber-500 w-40"
              />
              <button
                type="submit"
                class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-r-lg text-sm transition-colors"
              >
                Search
              </button>
            </form>
          </li>
        </ul>
      </nav>

      <main class="max-w-4xl mx-auto min-h-screen flex flex-col justify-start pt-8 px-4">
        <h1 class="text-4xl mx-auto mb-8 text-slate-600 font-light">Zcash Blockchain Explorer</h1>
        <Suspense>{props.children}</Suspense>
      </main>
    </div>
  );
};

export default App;
