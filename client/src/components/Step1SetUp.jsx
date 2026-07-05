import React, { useState } from 'react'
import { motion } from 'motion/react'
import { FaBriefcase, FaChartLine, FaFileUpload, FaMicrophoneAlt, FaUserTie, FaVenus, FaMars } from "react-icons/fa";
import { RiRobot2Line } from 'react-icons/ri';
import axios from 'axios'
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';



function Step1SetUp({onStart}) {
  const {userData} = useSelector((state)=>state.user)
  const dispatch = useDispatch()
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("")
  const [mode, setMode] = useState("Technical")
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([])
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false)
  const [analyzing, setAnalyzing] = useState(false);
  const [aiGender, setAiGender] = useState("female");
  const handledUploadResume = async () => {
    if(!resumeFile || analyzing) return;
    setAnalyzing(true)
    const formdata = new FormData()
    formdata.append("resume", resumeFile)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, {withCredentials:true})
      console.log(result.data)
      setRole(result.data.role || "")
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || [])
      setSkills(result.data.skills || [])
      setResumeText(result.data.resumeText || "")
      setAnalysisDone(true)
      
    } catch (error) {
      console.error("ERROR:", error);
      setAnalysisDone(false)
    }
    
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/generate-questions",{role,experience, mode, resumeText, projects, skills}, {withCredentials:true})
      console.log(result.data)
      if(userData){
        dispatch(setUserData({...userData, credits:result.data.creditsLeft}))
      }
      setLoading(false)
      onStart({
        ...result.data,
        role,
        experience,
        mode,
        aiGender
      })
    } catch (error) {
      console.log(error)
      setLoading(false)

    }
  }
  return (
    <motion.div 
    initial={{opacity:0}}
    animate={{opacity:1}}
    transition={{duration:0.6}}
    className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4'>

      <div className='w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden'>
        <motion.div 
        initial={{x:-80,opacity:0}}
        animate={{x:0,opacity:1}}
        transition={{duration:0.7 }}
        className='relative bg-gradient-to-br from-[#FDF4FF] to-[#F3E8FF] p-12 flex flex-col justify-center'>
          <h2 className='text-4xl font-bold text-gray-800 mb-6'>
            Start Your AI Interview
          </h2>
          <p className='text-gray-600 mb-10'>
            Practice real interview scenerios powered by AI. Improve communication, technical skills, and confidence.
          </p>
          <div className='space-y-5'>
            {
              [
                {
                  icon: <FaUserTie className='text-[#A855F7] text-xl'/>,
                  text: "Choose Role & Experience",
                },
                {
                  icon: <FaMicrophoneAlt className='text-[#A855F7] text-xl'/>,
                  text: "Smart Voice Interview",
                },
                {
                  icon: <FaChartLine className='text-[#A855F7] text-xl'/>,
                  text: "Performance Analytics",
                }
              ].map((item, index)=>(
                <motion.div key={index} 
                initial = {{y:30, opacity:0}}
                animate = {{y:0, opacity:1}}
                transition={{delay:0.3 + index * 0.15}}
                whileHover={{scale:1.03}}
                className='flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer'>
                  {item.icon}
                  <span className='text-gray-700 font-medium'>{item.text}</span>
                </motion.div>
              ))
            }
          </div>


        </motion.div>
        <motion.div 
        initial={{x:80, opacity:0}}
        animate={{x:0, opacity:1}}
        transition={{duration:0.7}}
        className='p-12 bg-white'>
          <h2 className='text-3xl font-bold text-gray-800 mb-8'>
            Interview SetUp
          </h2>
          <div className='space-y-6'>
            <div className='relative '>
              <FaUserTie className='absolute top-4 left-4 text-gray-400'/>
              <input type="text" placeholder='Enter role' className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A855F7] outline-none transition' 
              onChange={(e)=>setRole(e.target.value)} value={role}/>
            </div>
            <div className='relative '>
              <FaBriefcase className='absolute top-4 left-4 text-gray-400'/>
              <input type="text" placeholder='Experience (e.g. 2 years)' className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A855F7] outline-none transition' 
              onChange={(e)=>setExperience(e.target.value)} value={experience}/>
            </div>
            <select value={mode}
            onChange={(e)=>setMode(e.target.value)}
            className='w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A855F7] outline-none transition'>
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>

            {!analysisDone && (
              <motion.div 
              
              whileHover={{scale:1.02}}
              onClick={()=>document.getElementById("resumeUpload").click()}
              className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#A855F7] hover:bg-[#FDF4FF] transition'>
                <FaFileUpload  className='text-4xl mx-auto text-[#A855F7] mb-3'/>
                <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx" className='hidden' onChange={(e)=>setResumeFile(e.target.files[0])} />
                <p className='text-gray-600 font-medium'>
                  {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                </p>
                {resumeFile && (<motion.button 
                whileHover={{scale:1.02}}
                onClick={(e)=>{e.stopPropagation();handledUploadResume()}}
                className='mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition'>
                  {analyzing ? "Analyzing..." : "Analyze Resume"}
                </motion.button>)}
              </motion.div>
            ) }
            {analysisDone && (
              <motion.div 
              initial={{opacity:0,y:20}}
              animate={{opacity:1,y:0}}
              
              className='bg-gray-50 border-gray-200 rounded-xl p-5 space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800'>Resume Analysis Result
                </h3>
                {projects.length >0 &&(
                    <div>
                    <p className='font-medium text-gray-700 mb-1'>
                      Projects:
                    </p>
                    <ul className='list-disc list-inside text-gray-600 space-y-1'>
                      {projects.map((p,i)=>(
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                    </div>
                  )}
                  {skills.length >0 &&(
                    <div>
                    <p className='font-medium text-gray-700 mb-1'>
                      Skills:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {skills.map((s,i)=>(
                        <span key={i} className='bg-[#F3E8FF] text-[#9333EA] px-3 py-1 rounded-full text-sm'>{s}</span>
                      ))}
                    </div>
                    </div>
                  )}
              </motion.div>
            )}

            {/* AI Interviewer Gender Selection */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                
                <span className='text-gray-700 font-semibold text-md'>AI Interviewer</span>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                {/* Female AI Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAiGender("female")}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 flex flex-col items-center gap-2
                    ${aiGender === "female"
                      ? "border-[#A855F7] bg-[#FDF4FF] shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {aiGender === "female" && (
                    <div className='absolute top-2 right-2 w-5 h-5 bg-[#A855F7] rounded-full flex items-center justify-center'>
                      <svg className='w-3 h-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                      </svg>
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${aiGender === "female" ? "bg-[#F3E8FF]" : "bg-gray-100"}`}>
                    <RiRobot2Line className={`text-lg ${aiGender === "female" ? "text-[#A855F7]" : "text-gray-400"}`}/>
                  </div>
                  <span className={`font-medium text-sm ${aiGender === "female" ? "text-[#9333EA]" : "text-gray-600"}`}>Female AI</span>
                </motion.div>

                {/* Male AI Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAiGender("male")}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 flex flex-col items-center gap-2
                    ${aiGender === "male"
                      ? "border-[#A855F7] bg-[#FDF4FF] shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {aiGender === "male" && (
                    <div className='absolute top-2 right-2 w-5 h-5 bg-[#A855F7] rounded-full flex items-center justify-center'>
                      <svg className='w-3 h-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                      </svg>
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${aiGender === "male" ? "bg-[#F3E8FF]" : "bg-gray-100"}`}>
                    <RiRobot2Line className={`text-lg ${aiGender === "male" ? "text-[#A855F7]" : "text-gray-400"}`}/>
                  </div>
                  <span className={`font-medium text-sm ${aiGender === "male" ? "text-[#9333EA]" : "text-gray-600"}`}>Male AI</span>
                </motion.div>
              </div>
            </div>

            <motion.button
            onClick={handleStart}
            disabled={!role || !experience || loading}
            whileHover={{ scale: 1.03}}
            whileTap={{scale:0.95}}
            className='w-full disabled:bg-gray-600 bg-gradient-to-r from-[#A855F7] to-[#C026D3] hover:from-[#9333EA] hover:to-[#9333EA] text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'>
              {loading ? "Starting..." :"Start Interview"}
            </motion.button>
          </div>

        </motion.div>
      </div>

    </motion.div>
  )
}

export default Step1SetUp