import { useState, useEffect, useMemo } from 'preact/hooks';
import { getAllPlayers, type Player } from '../api/data';

type Question = {
  text: string;
  options: string[];
  correctAnswer: string;
  player: Player;
};

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');

  const allPlayers = useMemo(() => getAllPlayers(), []);
  const legends = useMemo(() => 
    allPlayers.filter(p => difficulty === 'easy' ? p.grand_slams > 0 : p.total_titles > 0),
    [allPlayers, difficulty]
  );

  const generateQuestion = () => {
    setFeedback(null);
    const randomPlayer = legends[Math.floor(Math.random() * legends.length)];
    const questionTypes = ['gs', 'country', 'hand', 'height'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let text = "";
    let correctAnswer = "";
    let options: string[] = [];

    switch (type) {
      case 'gs':
        text = `Combien de titres du Grand Chelem ${randomPlayer.full_name} a-t-il/elle remporté ?`;
        correctAnswer = randomPlayer.grand_slams.toString();
        options = [correctAnswer, 
                   Math.max(0, randomPlayer.grand_slams + 2).toString(), 
                   Math.max(0, randomPlayer.grand_slams - 1).toString(), 
                   (randomPlayer.grand_slams + 5).toString()];
        break;
      case 'country':
        text = `De quel pays vient ${randomPlayer.full_name} ?`;
        correctAnswer = randomPlayer.country;
        const otherCountries = Array.from(new Set(legends.map(p => p.country))).filter(c => c !== correctAnswer);
        options = [correctAnswer, ...otherCountries.sort(() => 0.5 - Math.random()).slice(0, 3)];
        break;
      case 'hand':
        text = `Quelle est la main forte de ${randomPlayer.full_name} ?`;
        correctAnswer = randomPlayer.hand === 'R' ? 'Droitier' : randomPlayer.hand === 'L' ? 'Gaucher' : 'Inconnu';
        options = ['Droitier', 'Gaucher'];
        break;
      case 'height':
        if (!randomPlayer.height_cm) return generateQuestion(); // Skip if no data
        text = `Quelle est la taille de ${randomPlayer.full_name} ?`;
        correctAnswer = `${randomPlayer.height_cm} cm`;
        options = [correctAnswer, 
                   `${randomPlayer.height_cm + 5} cm`, 
                   `${randomPlayer.height_cm - 5} cm`, 
                   `${randomPlayer.height_cm + 10} cm`];
        break;
      default:
        return generateQuestion();
    }

    // Shuffle options
    options = options.sort(() => 0.5 - Math.random());
    setCurrentQuestion({ text, options: Array.from(new Set(options)), correctAnswer, player: randomPlayer });
  };

  useEffect(() => {
    generateQuestion();
  }, [difficulty]);

  const handleAnswer = (option: string) => {
    if (feedback) return;

    const isCorrect = option === currentQuestion?.correctAnswer;
    setTotalAnswered(prev => prev + 1);
    if (isCorrect) setScore(prev => prev + 1);

    setFeedback({
      isCorrect,
      message: isCorrect ? "Excellent !" : `Raté ! La réponse était ${currentQuestion?.correctAnswer}.`
    });
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      {/* Header & Stats */}
      <div className="flex justify-between items-end bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Tennis <span className="text-emerald-500">Quiz</span></h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Testez vos connaissances</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-emerald-500 leading-none">{score}<span className="text-slate-500 text-sm">/{totalAnswered}</span></p>
          <p className="text-[10px] font-black uppercase text-slate-500 mt-1 tracking-widest">Score actuel</p>
        </div>
      </div>

      {/* Difficulty Toggle */}
      <div className="flex gap-2 justify-center">
        <button 
          onClick={() => setDifficulty('easy')}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === 'easy' ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
        >
          Légendes
        </button>
        <button 
          onClick={() => setDifficulty('hard')}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === 'hard' ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
        >
          Experts
        </button>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border-2 border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black italic select-none">?</div>
        
        <div className="relative z-10 space-y-8">
          <p className="text-2xl font-bold text-slate-200 leading-tight italic">
            "{currentQuestion.text}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                disabled={!!feedback}
                onClick={() => handleAnswer(option)}
                className={`
                  p-6 rounded-2xl text-left font-black uppercase italic transition-all duration-300 border-2
                  ${feedback 
                    ? option === currentQuestion.correctAnswer 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                      : 'bg-white/5 border-white/5 text-slate-600'
                    : 'bg-white/5 border-white/5 hover:border-emerald-500/50 hover:bg-white/10 text-slate-300'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`mt-8 p-6 rounded-2xl border flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 ${feedback.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <span className="font-bold">{feedback.message}</span>
              <button 
                onClick={generateQuestion}
                className="bg-white text-slate-950 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pro-tip */}
      <div className="text-center">
        <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em]">
          Données basées sur l'historique officiel ATP/WTA
        </p>
      </div>
    </div>
  );
}