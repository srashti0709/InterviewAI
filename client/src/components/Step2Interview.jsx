import React, { useRef, useState, useEffect } from 'react'
import maleVideo from '../assets/Videos/male-ai.mp4'
import femaleVideo from '../assets/Videos/female-ai.mp4'
import Timer from './Timer'
import { motion } from 'motion/react'
import { FaExclamation, FaMicrophone, FaMicrophoneSlash, FaUserCircle } from 'react-icons/fa'
import axios from 'axios'
import { ServerUrl } from '../App'
import { BsArrowLeft, BsArrowRight, BsRecordCircleFill } from 'react-icons/bs'
import { HiOutlineBriefcase } from 'react-icons/hi'
import { RiRobot2Line } from 'react-icons/ri'
import { MdOutlineWorkspaces } from 'react-icons/md'
import { FiClock, FiVideoOff } from 'react-icons/fi'


function Step2Interview({interviewData, onFinish}) {
  const {interviewId, questions, userName, role, experience, mode, aiGender = "female"} = interviewData
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true)
  const recognitionRef = useRef(null)
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voiceGender, setVoiceGender] = useState(aiGender)
  const [subtitle, setSubtitle] = useState("")

  const [webcamStream, setWebcamStream] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const webcamRef = useRef(null)

  useEffect(() => {
    let stream = null;
    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            aspectRatio: 1.777777778,
            width: { ideal: 640 },
            height: { ideal: 360 }
          },
          audio: false
        });
        setWebcamStream(stream);
      } catch (err) {
        console.error("Webcam access error:", err);
        setCameraError(true);
      }
    };
    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (webcamStream && webcamRef.current) {
      webcamRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const findBestVoice = (voices, gender) => {
      if (!voices || voices.length === 0) return null;

      const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith("en"));
      const targetVoices = englishVoices.length > 0 ? englishVoices : voices;

      const maleKeywords = [
        "david", "mark", "daniel", "fred", "male", "george", "guy", "james", 
        "ravi", "richard", "han", "sean"
      ];
      const femaleKeywords = [
        "zira", "samantha", "female", "hazel", "susan", "heera", "karen", 
        "moira", "tessa", "google us english", "en-us-x-sfg", "en-us-x-tpf", "en-us-x-yhi"
      ];

      if (gender === "female") {
        let voice = targetVoices.find(v => {
          const name = v.name.toLowerCase();
          return femaleKeywords.some(kw => name.includes(kw));
        });
        if (!voice) {
          voice = voices.find(v => {
            const name = v.name.toLowerCase();
            return femaleKeywords.some(kw => name.includes(kw));
          });
        }
        if (!voice) {
          voice = targetVoices.find(v => {
            const name = v.name.toLowerCase();
            return !maleKeywords.some(kw => name.includes(kw));
          });
        }
        return voice || targetVoices[0] || voices[0];
      } else {
        let voice = targetVoices.find(v => {
          const name = v.name.toLowerCase();
          return maleKeywords.some(kw => name.includes(kw));
        });
        if (!voice) {
          voice = voices.find(v => {
            const name = v.name.toLowerCase();
            return maleKeywords.some(kw => name.includes(kw));
          });
        }
        if (!voice) {
          voice = targetVoices.find(v => {
            const name = v.name.toLowerCase();
            return !femaleKeywords.some(kw => name.includes(kw));
          });
        }
        if (!voice) {
          voice = voices.find(v => {
            const name = v.name.toLowerCase();
            return !femaleKeywords.some(kw => name.includes(kw));
          });
        }
        return voice || targetVoices[0] || voices[0];
      }
    };

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const bestVoice = findBestVoice(voices, aiGender);
      if (bestVoice) {
        setSelectedVoice(prev => {
          if (prev && prev.name === bestVoice.name) {
            return prev;
          }
          return bestVoice;
        });
        setVoiceGender(aiGender);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [aiGender]);

  const videoSource = aiGender === "male" ? maleVideo : femaleVideo;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if(!window.speechSynthesis || !selectedVoice){
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      const humanText = text
  .replace(/,/g, ", ")
  .replace(/\./g, ".  ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;

      utterance.rate = 1.18;
utterance.pitch = 1.0;
utterance.volume = 1;
      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);
        if(isMicOn) {
          startMic();
        }

        setTimeout(() => {
          setSubtitle("");
          resolve();
        },300);
      }
      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    })
  }
  useEffect(()=>{
    if(!selectedVoice){
      return;
    }

    const runIntro = async () => {
      if(isIntroPhase){
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );
        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );
        setIsIntroPhase(false)
      }
      else if(currentQuestion){
        await new Promise(r => setTimeout(r, 800));

        if(currentIndex === questions.length - 1){
          await speakText("Alright, this one might be a bit more challenging.");
        }
        await speakText(currentQuestion.question);
        if(isMicOn){
          startMic()
        }
      }
      
    }
    runIntro()
  },[selectedVoice, isIntroPhase, currentIndex])

  useEffect(()=>{
    if(isIntroPhase) return;
    if(!currentQuestion) return;
   
    const timer = setInterval(() => {
      setTimeLeft((prev)=>{
        if(prev <= 1){
          clearInterval(timer)
          return 0;
        }
        return prev - 1;
      })
    }, 1000);
    return () => clearInterval(timer)
  },[isIntroPhase, currentIndex])
  useEffect(()=>{
    if(!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.onstart = () => {
    setIsMicOn(true);
};

recognition.onend = () => {
    setIsMicOn(false);
};
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    }
    recognitionRef.current = recognition;
  },[])
  const startMic = () => {
    if(recognitionRef.current && !isAIPlaying){
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };
  const stopMic = () => {
    if(recognitionRef.current){
      recognitionRef.current.stop();
    }
  }
  const toggleMic = () => {
    if(isMicOn){
      stopMic();
    }else{
      startMic();
    }
    setIsMicOn(!isMicOn);
  }
  const submitAnswer = async () =>{
    if(isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer",{
        interviewId,
        questionIndex : currentIndex,
        answer,
        timeTaken:
          currentQuestion.timeLimit - timeLeft,
      }, {withCredentials:true})
      setFeedback(result.data.feedback)
      speakText(result.data.feedback);
      setIsSubmitting(false)
    } catch (error) {
      console.log(error.response?.data);
      setIsSubmitting(false);
    }

  }
  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if(currentIndex + 1 >= questions.length){
      finishInterview();
      return;
    }
    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if(isMicOn) startMic();
    },500);
    
  }
  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", {
        interviewId
      },{withCredentials:true})
      console.log(result.data)
      onFinish(result.data);
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{
    if(isIntroPhase) return;
    if(!currentQuestion) return;
    if(!timeLeft === 0 && !isSubmitting && !feedback){
      submitAnswer();
    }
  },[timeLeft]);
  useEffect(() => {
    return () => {
      if(recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
      if(webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    }
  },[])

  useEffect (() => {
    if(!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex])

  return (
    <div className='min-h-screen bg-linear-to-br from-[#FDF4FF] via-white to-[#F3E8FF] flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>
        {/* Left Panel — video section (unchanged) */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
          <video src={videoSource} key={videoSource}
          ref={videoRef} 
          muted playsInline preload='auto'
          className='w-full h-auto object-cover'/>
          </div>
          {/* subtitle */}
          {subtitle && (
            <div className='w-full mex-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}

          {/* timer */}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-md text-gray-500'>
                Interview Status
              </span>
              {isAIPlaying && <span className='text-md font-bold text-[#A855F7]'>
               {isAIPlaying ? "AI Speaking" : ""}
              </span>}
            </div>
            <div className='h-px bg-gray-200'></div>
            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60}/>
            </div>
            <div className='h-px bg-gray-200'></div>
            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-[#A855F7]'>{currentIndex + 1}</span>
                <span className='text-sm text-gray-400'>Current Question</span>
              </div>
              <div>
                <span className='text-2xl font-bold text-[#A855F7]'>{questions.length}</span>
                <span className='text-sm text-gray-400'>Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>

          {/* Right Panel Header */}
          <div className='mb-4'>
            <div className='flex items-start gap-4'>
              {/* Left: Title + Chips (fills remaining width) */}
              <div className='flex-1 min-w-0'>
                <h2 className='text-xl sm:text-2xl font-bold text-[#A855F7] mb-2'>
                  AI Smart Interview
                </h2>

                {/* Information Chips */}
                <div className='flex flex-wrap items-center gap-2.5'>
              {/* Candidate Name */}
              <div className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-medium text-xs sm:text-sm text-gray-700 shadow-xs'>
                <FaUserCircle className='text-[#A855F7] text-lg' />
                <span>{userName}</span>
              </div>

              {/* Job Role */}
              {role && (
                <div className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-medium text-xs sm:text-sm text-gray-700 shadow-xs'>
                  <HiOutlineBriefcase className='text-[#A855F7] text-lg' />
                  <span>{role}</span>
                </div>
              )}


              {/* AI Interviewer */}
              <div className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-medium text-xs sm:text-sm text-gray-700 shadow-xs'>
                <RiRobot2Line className='text-[#A855F7] text-lg' />
                <span>{aiGender === "male" ? "Male AI" : "Female AI"}</span>
              </div>

              {/* Interview Mode */}
              {mode && (
                <div className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-medium text-xs sm:text-sm text-gray-700 shadow-xs'>
                  <MdOutlineWorkspaces className='text-[#A855F7] text-lg' />
                  <span>{mode} Mode</span>
                </div>
              )}

              {/* Recording Status */}
              <div className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-medium text-xs sm:text-sm text-gray-700 shadow-xs'>
                {("webkitSpeechRecognition" in window) ? (
                  <>
                    <BsRecordCircleFill className={`text-md ${isMicOn ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                    <span>{isMicOn ? 'Recording' : 'Muted'}</span>
                  </>
                ) : (
                  <>
                    <BsRecordCircleFill className='text-md text-[#A855F7]' />
                    <span>Interview Active</span>
                  </>
                )}
              </div>

              {/* Timer */}
              <div className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-medium text-xs sm:text-sm text-gray-700 shadow-xs'>
                <FiClock className='text-[#A855F7] text-lg' />
                <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
              </div>
                </div>
              </div>

              {/* Right: Webcam Preview */}
              <div className='w-36 sm:w-40 md:w-48 lg:w-52 aspect-video bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden z-10 flex items-center justify-center shrink-0'>
                {!cameraError && webcamStream ? (
                  <video
                    ref={webcamRef}
                    autoPlay
                    playsInline
                    muted
                    className='w-full h-full object-cover scale-x-[-1]'
                  />
                ) : (
                  <div className='flex flex-col items-center justify-center text-[10px] text-gray-500 font-medium px-2 text-center'>
                    <FiVideoOff className='text-gray-400 text-sm mb-1' />
                    <span>Camera Off</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className='h-px bg-gray-200 mb-6'></div>

          {/* Question Card */}
          {!isIntroPhase && (<div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-sm sm:text-md text-gray-400 mb-2'>
              Question {currentIndex + 1} of {questions.length} 
            </p>
            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed pr-16'>{currentQuestion ?.question}</div>
          </div>)}

          {/* Answer Box */}
          <textarea onChange={(e) => setAnswer(e.target.value)} value={answer} placeholder='Type your answer here...' className='flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border-gray-200 focus:ring-2 focus:ring-[#A855F7] transition text-gray-800'/>

          {/* Microphone + Submit */}
          {!feedback ? ( <div className='flex items-center gap-4 mt-6'>
            <motion.button 
            onClick={toggleMic}
            whileTap={{scale:0.9}}
            className='w-12 h-12 sm:w-12 flex items-center justify-center rounded-full bg-black text-white shadow-lg shrink-0'>
              {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
            </motion.button>
            <motion.button 
            onClick={submitAnswer}
            disabled = {isSubmitting}
            whileTap={{scale:0.95}}
            className='flex-1 bg-gradient-to-r from-[#A855F7] to-[#C026D3] text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
              {isSubmitting ? "Submitting..." : "Submit Answer"}

            </motion.button>

          </div>) : (
            <motion.div 
            initial={{opacity:0}}
            animate={{opacity:1}}
            className='mt-6 bg-[#FDF4FF] border border-[#F3E8FF] p-5 rounded-2xl shadow-sm'>
              <p className='text-[#9333EA] font-medium mb-4'>{feedback}</p>
              <button 
              onClick={handleNext}
              className='w-full bg-gradient-to-r from-[#A855F7] to-[#C026D3] text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>
                Next Question <BsArrowRight size={18}/>
              </button>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Step2Interview