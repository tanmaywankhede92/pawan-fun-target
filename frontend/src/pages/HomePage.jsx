import { useAuth } from '@hooks/useAuth';

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Fun Target</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              {user?.username}
            </span>
            <span className="text-yellow-400 font-semibold">
              Balance: ${user?.balance || '0.00'}
            </span>
            <button
              onClick={logout}
              className="px-4 py-1.5 bg-red-600/80 text-white text-sm rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-white/60 mt-20">
          <p className="text-lg">Game UI coming in Phase 3</p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
