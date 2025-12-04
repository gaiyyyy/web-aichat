import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    const roomId = Math.floor(Math.random() * 1000000);
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-slate-200">
          <h1 className="text-5xl font-bold text-slate-800 mb-16 tracking-tight">
            AI 脑筋急转弯
          </h1>

          <button
            onClick={handleStartGame}
            className="w-full max-w-xs mx-auto px-12 py-5 bg-slate-800 text-white text-xl font-medium rounded-2xl hover:bg-slate-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            开始游戏
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
