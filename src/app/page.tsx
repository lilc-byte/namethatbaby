'use client';

import { useEffect, useState } from 'react';
import girlNames from '@/data/girl-names.json';

type BabyName = {
  id: number;
  name: string;
  origin: string;
  meaning: string;
};

const SAMPLE_NAMES: BabyName[] = girlNames as BabyName[];

const shuffleNames = (names: BabyName[]): BabyName[] => {
  const arr = [...names];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function Home() {
  const [user, setUser] = useState<'craig' | 'mosha'>('craig');
  const [index, setIndex] = useState(0);
  const [names, setNames] = useState<BabyName[] | null>(null);
  const [likes, setLikes] = useState<Record<'craig' | 'mosha', BabyName[]>>({
    craig: [],
    mosha: [],
  });
  const [dislikes, setDislikes] = useState<Record<'craig' | 'mosha', BabyName[]>>({
    craig: [],
    mosha: [],
  });
  const [history, setHistory] = useState<
    { user: 'craig' | 'mosha'; direction: 'like' | 'dislike'; name: BabyName }[]
  >([]);

  // Initialize shuffled names on client to avoid hydration mismatch
  useEffect(() => {
    setNames(shuffleNames(SAMPLE_NAMES));
  }, []);

  const current = names ? names[index] : null;

  const swipe = (direction: 'like' | 'dislike') => {
    if (!current || !names) return;

    setHistory(prev => [...prev, { user, direction, name: current }]);

    if (direction === 'like') {
      setLikes(prev => ({
        ...prev,
        [user]: [...prev[user], current],
      }));
    } else {
      setDislikes(prev => ({
        ...prev,
        [user]: [...prev[user], current],
      }));
    }

    setIndex(prev => prev + 1);
  };

  const undo = () => {
    if (!names) return;

    setHistory(prevHistory => {
      if (prevHistory.length === 0 || index === 0) return prevHistory;

      const last = prevHistory[prevHistory.length - 1];
      const newHistory = prevHistory.slice(0, -1);
      const newIndex = index - 1;

      const removeFrom = (arr: BabyName[]) =>
        arr.filter(n => n.id !== last.name.id);

      setLikes(prev => ({
        ...prev,
        [last.user]:
          last.direction === 'like'
            ? removeFrom(prev[last.user])
            : prev[last.user],
      }));

      setDislikes(prev => ({
        ...prev,
        [last.user]:
          last.direction === 'dislike'
            ? removeFrom(prev[last.user])
            : prev[last.user],
      }));

      setIndex(newIndex);
      return newHistory;
    });
  };

  const reset = () => {
    setNames(shuffleNames(SAMPLE_NAMES));
    setIndex(0);
    setLikes({ craig: [], mosha: [] });
    setDislikes({ craig: [], mosha: [] });
    setHistory([]);
  };

  const summarizePrefs = (namesList: BabyName[]) => {
    if (namesList.length === 0) return { count: 0, avgLength: 0, commonEnding: '' };

    const avgLength =
      namesList.reduce((sum, n) => sum + n.name.length, 0) / namesList.length;

    const endingCounts: Record<string, number> = {};
    for (const n of namesList) {
      const ending = n.name.slice(-2).toLowerCase();
      endingCounts[ending] = (endingCounts[ending] || 0) + 1;
    }
    const commonEnding =
      Object.entries(endingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      count: namesList.length,
      avgLength: Number(avgLength.toFixed(1)),
      commonEnding,
    };
  };

  // While names are null, show loading state (prevents hydration mismatch)
  if (!names) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
        <h1 className="text-3xl font-bold mb-4">Name That Baby</h1>
        <p className="text-slate-300">Loading names…</p>
      </main>
    );
  }

  if (!current) {
    const craigLikes = likes.craig.map(n => n.name);
    const moshaLikes = likes.mosha.map(n => n.name);
    const mutual = craigLikes.filter(n => moshaLikes.includes(n));

    const craigSummary = summarizePrefs(likes.craig);
    const moshaSummary = summarizePrefs(likes.mosha);

    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
        <h1 className="text-3xl mb-4">No more names!</h1>

        <div className="max-w-md w-full space-y-3 text-center">
          <p>
            <span className="font-semibold">Craig likes:</span>{' '}
            {craigLikes.join(', ') || 'none yet'}
          </p>
          <p>
            <span className="font-semibold">Mosha likes:</span>{' '}
            {moshaLikes.join(', ') || 'none yet'}
          </p>
          <p>
            <span className="font-semibold">Mutual likes:</span>{' '}
            {mutual.join(', ') || 'none yet'}
          </p>
          <p className="mt-4 text-sm text-slate-300">
            Craig prefers names about {craigSummary.avgLength || '-'} letters long,
            often ending with “{craigSummary.commonEnding || '-'}”.
          </p>
          <p className="text-sm text-slate-300">
            Mosha prefers names about {moshaSummary.avgLength || '-'} letters long,
            often ending with “{moshaSummary.commonEnding || '-'}”.
          </p>
        </div>

        <button
          onClick={reset}
          className="mt-6 px-6 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium"
        >
          Start over
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Name That Baby</h1>

      <div className="mb-4 flex gap-3">
        <button
          onClick={() => setUser('craig')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            user === 'craig' ? 'bg-sky-500' : 'bg-slate-700'
          }`}
        >
          Craig
        </button>
        <button
          onClick={() => setUser('mosha')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            user === 'mosha' ? 'bg-sky-500' : 'bg-slate-700'
          }`}
        >
          Mosha
        </button>
      </div>

      <div className="w-80 max-w-sm bg-slate-800 rounded-2xl shadow-xl p-6 text-center">
        <div className="text-xs text-slate-400 mb-2">
          Swiping as: <span className="font-semibold">{user}</span>
        </div>

        <div className="text-4xl font-semibold mb-2">{current.name}</div>
        <div className="text-sm text-slate-300 mb-1">Origin: {current.origin}</div>
        <div className="text-sm text-slate-300 mb-4">Meaning: {current.meaning}</div>
        <div className="text-xs text-slate-400 mb-4">
          {index + 1} of {names.length}
        </div>

        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={() => swipe('dislike')}
            className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium"
          >
            Nope
          </button>
          <button
            onClick={() => swipe('like')}
            className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
          >
            Love it
          </button>
        </div>

        <button
          onClick={undo}
          className="mt-3 px-4 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-xs text-white"
        >
          Undo last swipe
        </button>
      </div>
    </main>
  );
}
