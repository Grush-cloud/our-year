import React, { useState, useEffect } from 'react';
import { Heart, Lock, Unlock, X, ChevronLeft, ChevronRight, MessageCircle, Sparkles, Camera, Laugh, TrendingUp } from 'lucide-react';

// Import all your data
import { config } from './data/config';
import { stats } from './data/stats';
import { insideJokes } from './data/jokes';
import { timelineData } from './data/timeline';
import { photoGallery } from './data/photos';
import { letters } from './data/letters';
import { chatbotResponses } from './data/chatbot';

function App() {
  const [currentPage, setCurrentPage] = useState('passcode');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedJoke, setSelectedJoke] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);
  const [showHiddenMessage, setShowHiddenMessage] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [puzzlePieces, setPuzzlePieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);

  // Calculate days together
  const startDate = new Date(config.relationshipStartDate);
  const today = new Date();
  const daysTogether = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  // Combine stats with calculated days
  const coupleStats = {
    daysTogether: daysTogether,
    ...stats
  };

  // Initialize puzzle pieces
  useEffect(() => {
    if (currentPage === 'puzzle' && puzzlePieces.length === 0) {
      const pieces = [];
      for (let i = 0; i < 16; i++) {
        pieces.push({
          id: i,
          correctPosition: i,
          currentPosition: i
        });
      }
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = pieces[i].currentPosition;
        pieces[i].currentPosition = pieces[j].currentPosition;
        pieces[j].currentPosition = temp;
      }
      setPuzzlePieces(pieces);
    }
  }, [currentPage, puzzlePieces.length]);

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', text: chatInput };
    const newMessages = [...chatMessages, userMessage];

    let botResponse = "Hmm, I'm not sure about that. Try asking me about my favorite memory, why I love you, or what makes me smile! 💕";
    
    const lowerInput = chatInput.toLowerCase();
    for (const key of Object.keys(chatbotResponses)) {
      if (lowerInput.includes(key)) {
        botResponse = chatbotResponses[key];
        break;
      }
    }

    setTimeout(() => {
      setChatMessages([...newMessages, { type: 'bot', text: botResponse }]);
    }, 500);

    setChatMessages(newMessages);
    setChatInput('');
  };

  const handlePieceClick = (piece) => {
    if (!selectedPiece) {
      setSelectedPiece(piece);
    } else {
      const newPieces = [...puzzlePieces];
      const piece1Index = newPieces.findIndex(p => p.id === selectedPiece.id);
      const piece2Index = newPieces.findIndex(p => p.id === piece.id);
      
      const tempPos = newPieces[piece1Index].currentPosition;
      newPieces[piece1Index].currentPosition = newPieces[piece2Index].currentPosition;
      newPieces[piece2Index].currentPosition = tempPos;
      
      setPuzzlePieces(newPieces);
      setSelectedPiece(null);

      const isComplete = newPieces.every(p => p.correctPosition === p.currentPosition);
      if (isComplete) {
        setTimeout(() => setPuzzleComplete(true), 300);
      }
    }
  };

  const handlePasscodeSubmit = () => {
    if (passcodeInput.toLowerCase() === config.passcodeAnswer.toLowerCase()) {
      setIsUnlocked(true);
      setTimeout(() => setCurrentPage('landing'), 500);
    } else {
      setPasscodeInput('');
      alert('Not quite... think about what I always call you 💕');
    }
  };

  const MomentCard = ({ moment, index }) => {
    const [unlocked, setUnlocked] = useState(moment.unlocked || !moment.riddle);
    const [riddleInput, setRiddleInput] = useState('');

    const handleUnlock = () => {
      if (riddleInput.toLowerCase() === moment.riddleAnswer?.toLowerCase()) {
        setUnlocked(true);
      } else {
        setRiddleInput('');
        alert('Not quite! Try again 💭');
      }
    };

    return (
      <div className={`flex gap-6 mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className="flex-1"></div>
        <div className="relative flex items-center">
          <div className="w-4 h-4 bg-pink-500 rounded-full border-4 border-white shadow-lg"></div>
        </div>
        <div className="flex-1">
          <div 
            className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-pink-100 ${
              !unlocked ? 'opacity-70' : ''
            }`}
            onClick={() => unlocked && setSelectedMoment(moment)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-pink-600 font-semibold">{moment.date}</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">{moment.title}</h3>
              </div>
              {!unlocked && <Lock className="w-5 h-5 text-pink-300" />}
            </div>
            
            {unlocked ? (
              <>
                <p className="text-gray-600 leading-relaxed">{moment.description}</p>
                <div className="mt-4 h-48 rounded-lg overflow-hidden border-2 border-pink-100">
                  <img 
                    src={moment.photo} 
                    alt={moment.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600 italic">🔒 Unlock this memory...</p>
                <p className="text-sm font-medium text-gray-700">{moment.riddle}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={riddleInput}
                    onChange={(e) => setRiddleInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="Your answer..."
                    className="flex-1 px-4 py-2 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
                  />
                  <button
                    onClick={handleUnlock}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    <Unlock className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // PASSCODE PAGE
  if (currentPage === 'passcode') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className={`bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-500 border-4 border-pink-200 ${
            isUnlocked ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
          }`}>
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">Our Year</h1>
              <p className="text-gray-600">A journey through our story</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do I call you when you make me smile? 💕
                </label>
                <input
                  type="text"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasscodeSubmit()}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 transition-colors"
                />
              </div>
              
              <button
                onClick={handlePasscodeSubmit}
                className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3 rounded-xl font-semibold hover:from-pink-500 hover:to-rose-500 transition-all transform hover:scale-105 shadow-lg"
              >
                Enter Our World
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Made with 💕 just for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  // LANDING PAGE
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Heart
              key={i}
              className="absolute text-pink-300 opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 30 + 10}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-3xl w-full relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border-4 border-pink-200">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-6">
              One Year Ago Today...
            </h1>
            
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed mb-8">
              <p>Everything changed. ✨</p>
              <p>I met someone who turned my world upside down in the best way possible.</p>
              <p>Someone who makes me laugh until my stomach hurts, who understands my silence, who dances with me in parking lots and kitchen floors.</p>
              <p className="text-2xl font-semibold text-pink-600">I met you. 💕</p>
            </div>

            <button
              onClick={() => setCurrentPage('timeline')}
              className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-pink-500 hover:to-rose-500 transition-all transform hover:scale-110 shadow-lg"
            >
              Explore Our Story
            </button>

            <div className="mt-12">
              <button
                onClick={() => setShowHiddenMessage(!showHiddenMessage)}
                className="text-xs text-pink-400 hover:text-pink-600 transition-colors"
              >
                ✨
              </button>
              {showHiddenMessage && (
                <p className="mt-4 text-sm text-pink-600 italic">
                  P.S. - There are hidden surprises throughout this site. Keep exploring! 💕
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STATS PAGE
  if (currentPage === 'stats') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pink-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Our Stats</h1>
            <button
              onClick={() => setCurrentPage('timeline')}
              className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
            >
              ← Back
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <TrendingUp className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Us By The Numbers</h2>
            <p className="text-gray-600 text-lg">Our relationship in beautiful statistics 💕</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(coupleStats).map(([key, value]) => (
              <div
                key={key}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-pink-100 text-center"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-3">
                  {value}
                </div>
                <div className="text-gray-600 font-medium capitalize">
                  {key === 'daysTogether' ? 'Days Together' :
                   key === 'datesCount' ? 'Dates' :
                   key === 'milesTravel' ? 'Miles Traveled' :
                   key === 'photosTaken' ? 'Photos Taken' :
                   key === 'insideJokes' ? 'Inside Jokes' :
                   key === 'iLoveYous' ? 'I Love Yous' :
                   key === 'laughsShared' ? 'Laughs Shared' :
                   key}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // INSIDE JOKES PAGE
  if (currentPage === 'jokes') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pink-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Inside Jokes</h1>
            <button
              onClick={() => setCurrentPage('timeline')}
              className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
            >
              ← Back
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <Laugh className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Inside Jokes Encyclopedia</h2>
            <p className="text-gray-600 text-lg">The moments that make us laugh until we cry 😂</p>
          </div>

          <div className="grid gap-6">
            {insideJokes.map((joke) => (
              <div
                key={joke.id}
                onClick={() => setSelectedJoke(joke)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-102 border-2 border-pink-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{joke.title}</h3>
                    <p className="text-sm text-pink-600 font-medium">{joke.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">
                      Used {joke.frequency}
                    </span>
                    <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-medium">
                      {'⭐'.repeat(joke.funnyRating)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{joke.origin}</p>
                <p className="text-pink-500 font-medium mt-3">Click to read the full story →</p>
              </div>
            ))}
          </div>
        </div>

        {selectedJoke && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedJoke(null)}>
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border-4 border-pink-200" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setSelectedJoke(null)}
                className="float-right text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <Laugh className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">{selectedJoke.title}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <span className="px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">
                    📅 {selectedJoke.date}
                  </span>
                  <span className="px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-sm font-medium">
                    🔄 Used {selectedJoke.frequency}
                  </span>
                </div>
              </div>

              <div className="bg-pink-50 border-l-4 border-pink-400 p-6 rounded-r-lg mb-6">
                <p className="text-sm font-semibold text-pink-800 mb-2">THE ORIGIN STORY</p>
                <p className="text-gray-700 leading-relaxed">{selectedJoke.story}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PUZZLE PAGE
  if (currentPage === 'puzzle') {
    const puzzleImage = "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800&h=800&fit=crop";
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pink-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Photo Puzzle</h1>
            <button
              onClick={() => setCurrentPage('timeline')}
              className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
            >
              ← Back
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Sparkles className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {puzzleComplete ? "You Did It! 🎉" : "Solve the Puzzle"}
            </h2>
            <p className="text-gray-600 text-lg">
              {puzzleComplete 
                ? "The hidden message is revealed!" 
                : "Click two pieces to swap them. Put the photo back together! 💕"}
            </p>
          </div>

          {!puzzleComplete ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-pink-200">
              <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
                {puzzlePieces.sort((a, b) => a.currentPosition - b.currentPosition).map((piece) => (
                  <div
                    key={piece.id}
                    onClick={() => handlePieceClick(piece)}
                    className={`aspect-square cursor-pointer transition-all transform hover:scale-105 border-2 rounded-lg overflow-hidden ${
                      selectedPiece?.id === piece.id ? 'border-pink-500 scale-105 shadow-lg' : 'border-pink-200'
                    }`}
                    style={{
                      backgroundImage: `url(${puzzleImage})`,
                      backgroundSize: '400%',
                      backgroundPosition: `${(piece.correctPosition % 4) * 33.33}% ${Math.floor(piece.correctPosition / 4) * 33.33}%`
                    }}
                  >
                  </div>
                ))}
              </div>
              <p className="text-center mt-6 text-gray-600">
                {selectedPiece ? "Now click another piece to swap!" : "Click a piece to start"}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-8">
              <div className="max-w-2xl mx-auto">
                <img 
                  src={puzzleImage} 
                  alt="Completed puzzle"
                  className="w-full rounded-3xl shadow-2xl border-4 border-pink-300"
                />
              </div>
              <div className="bg-white p-12 rounded-3xl shadow-xl border-4 border-pink-200 max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-6">
                  Hidden Message Unlocked! 💌
                </h3>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  "Every piece of my life makes sense when you're in it. 
                  You complete me in ways I never knew I needed. 
                  Thank you for being my missing piece. 💕"
                </p>
                <p className="text-gray-500 italic">- Love, Me</p>
              </div>
              <button
                onClick={() => {
                  setPuzzleComplete(false);
                  setPuzzlePieces([]);
                  setSelectedPiece(null);
                }}
                className="px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full font-semibold hover:from-pink-500 hover:to-rose-500 transition-all transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // POLAROID WALL PAGE
  if (currentPage === 'polaroid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pink-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Polaroid Wall</h1>
            <button
              onClick={() => setCurrentPage('timeline')}
              className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
            >
              ← Back
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <Camera className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Polaroid Collection</h2>
            <p className="text-gray-600 text-lg">Moments captured, memories cherished 📸</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {photoGallery.map((photo, index) => (
              <div
                key={index}
                className="transform hover:scale-110 hover:z-10 transition-all duration-300 cursor-pointer"
                style={{
                  transform: `rotate(${photo.rotation}deg)`,
                }}
                onClick={() => setCurrentPhotoIndex(index)}
              >
                <div className="bg-white p-4 pb-16 shadow-2xl rounded-sm">
                  <div className="relative overflow-hidden bg-gray-200" style={{paddingBottom: '100%'}}>
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-center mt-4 text-gray-700 text-lg">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentPhotoIndex !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setCurrentPhotoIndex(null)}
              className="absolute top-4 right-4 text-white hover:text-pink-400"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              onClick={() => setCurrentPhotoIndex((currentPhotoIndex - 1 + photoGallery.length) % photoGallery.length)}
              className="absolute left-4 text-white hover:text-pink-400"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>
            
            <div className="max-w-4xl w-full">
              <img
                src={photoGallery[currentPhotoIndex].url}
                alt={photoGallery[currentPhotoIndex].caption}
                className="w-full h-auto rounded-2xl"
              />
              <p className="text-white text-center text-xl mt-6">{photoGallery[currentPhotoIndex].caption}</p>
            </div>
            
            <button
              onClick={() => setCurrentPhotoIndex((currentPhotoIndex + 1) % photoGallery.length)}
              className="absolute right-4 text-white hover:text-pink-400"
            >
              <ChevronRight className="w-12 h-12" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // CHATBOT PAGE
  if (currentPage === 'chatbot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pink-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Ask Me Anything</h1>
            <button
              onClick={() => setCurrentPage('timeline')}
              className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
            >
              ← Back
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <MessageCircle className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Chat With Me 💬</h2>
            <p className="text-gray-600 text-lg">Ask me anything about us, our memories, or how I feel!</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-4 border-pink-200 overflow-hidden flex flex-col" style={{height: '600px'}}>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <p className="mb-4">👋 Hi! Ask me questions like:</p>
                  <div className="space-y-2 text-sm">
                    <p className="bg-pink-50 inline-block px-4 py-2 rounded-full">"What's your favorite memory?"</p>
                    <br />
                    <p className="bg-pink-50 inline-block px-4 py-2 rounded-full">"Why do you love me?"</p>
                    <br />
                    <p className="bg-pink-50 inline-block px-4 py-2 rounded-full">"What was your first impression?"</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t-2 border-pink-200 p-4 bg-pink-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask me something..."
                  className="flex-1 px-4 py-3 border-2 border-pink-200 rounded-full focus:outline-none focus:border-pink-400"
                />
                <button
                  onClick={handleChatSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full font-semibold hover:from-pink-500 hover:to-rose-500 transition-all"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TIMELINE PAGE
  if (currentPage === 'timeline') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pink-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Our Journey</h1>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setCurrentPage('stats')}
                className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
              >
                Stats
              </button>
              <button
                onClick={() => setCurrentPage('jokes')}
                className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
              >
                Inside Jokes
              </button>
              <button
                onClick={() => setCurrentPage('puzzle')}
                className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
              >
                Puzzle
              </button>
              <button
                onClick={() => setCurrentPage('polaroid')}
                className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
              >
                Polaroid Wall
              </button>
              <button
                onClick={() => setCurrentPage('chatbot')}
                className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
              >
                Chat
              </button>
              <button
                onClick={() => setCurrentPage('letters')}
                className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
              >
                Letters
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Timeline</h2>
            <p className="text-gray-600 text-lg">Every moment, every memory, every step of our journey together</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-pink-300 via-rose-300 to-pink-300"></div>
            
            {timelineData.map((moment, index) => (
              <MomentCard key={moment.id} moment={moment} index={index} />
            ))}
          </div>
        </div>

        {selectedMoment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMoment(null)}>
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border-4 border-pink-200" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setSelectedMoment(null)}
                className="float-right text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <p className="text-sm text-pink-600 font-semibold mb-2">{selectedMoment.date}</p>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">{selectedMoment.title}</h3>
              
              <div className="mb-6 rounded-2xl overflow-hidden border-4 border-pink-100">
                <img 
                  src={selectedMoment.photo} 
                  alt={selectedMoment.title}
                  className="w-full h-96 object-cover"
                />
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed">{selectedMoment.description}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LETTERS PAGE
  if (currentPage === 'letters') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-rose-50">
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pink-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Letters I Never Sent</h1>
            <button
              onClick={() => setCurrentPage('timeline')}
              className="px-4 py-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
            >
              ← Back to Timeline
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Words From My Heart</h2>
            <p className="text-gray-600 text-lg">Things I needed you to know</p>
          </div>

          <div className="grid gap-8">
            {letters.map((letter) => (
              <div
                key={letter.id}
                onClick={() => setSelectedLetter(letter)}
                className={`cursor-pointer transform hover:scale-105 transition-all ${
                  letter.style === 'handwritten' 
                    ? 'bg-amber-50 border-2 border-pink-200 rotate-1 hover:rotate-0' 
                    : 'bg-white border-2 border-pink-200 -rotate-1 hover:rotate-0'
                } p-8 rounded-2xl shadow-lg hover:shadow-2xl`}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{letter.title}</h3>
                <p className={`text-gray-700 leading-relaxed ${
                  letter.style === 'handwritten' ? 'font-serif' : ''
                }`}>
                  {letter.content.substring(0, 150)}...
                </p>
                <p className="text-pink-500 font-medium mt-4">Click to read more →</p>
              </div>
            ))}
          </div>
        </div>

        {selectedLetter && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLetter(null)}>
            <div 
              className={`max-w-2xl w-full p-12 max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${
                selectedLetter.style === 'handwritten' 
                  ? 'bg-amber-50 border-4 border-pink-200' 
                  : 'bg-white border-4 border-pink-200'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedLetter(null)}
                className="float-right text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-3xl font-bold text-gray-800 mb-8">{selectedLetter.title}</h3>
              <p className={`text-gray-700 text-lg leading-relaxed whitespace-pre-line ${
                selectedLetter.style === 'handwritten' ? 'font-serif' : ''
              }`}>
                {selectedLetter.content}
              </p>
              
              <div className="mt-8 text-right">
                <p className="text-gray-600 font-serif italic">With all my love,</p>
                <p className="text-2xl font-bold text-pink-600 mt-2">Me 💕</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default App;