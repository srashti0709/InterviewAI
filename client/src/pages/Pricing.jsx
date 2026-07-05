import React, { useState } from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import axios from 'axios'
import { ServerUrl } from '../App'
import { current } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'



function Pricing() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [loadingPlan, setLoadingPlan] = useState(null)
  const dispatch = useDispatch()
  const plans = [
    {
      id:"free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview perparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id:"basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practise and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id:"pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job interview preparation",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge:"Best Value",
    },

  ]
  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id)
      const amount = 
        plan.id === "basic" ? 100 :
        plan.id === "pro" ? 500 : 0;
        const result = await axios.post(ServerUrl + "/api/payment/order",{
          planId: plan.id,
          amount: amount,
          credits: plan.credits,
        },{withCredentials:true})
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: result.data.amount,
          currency: "INR",
          name: "InterviewAI",
          description: `${plan.name} - ${plan.credits} Credits`,
          order_id:result.data.id,
          handler:async function (response) {
            const verifypay = await axios.post(ServerUrl + "/api/payment/verify",response,{withCredentials:true})
            dispatch(setUserData(verifypay.data.user))
            alert("Payment Successful! Credits added")
            navigate("/")
          },
          theme:{
            color:"#A855F7",
          },

        }
        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoadingPlan(null)
      } catch (error) {
        console.log(error)
        setLoadingPlan(null)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-[#FDF4FF] py-16 px-'>
      <div className='max-w-6xl mx-auto mb-14 flex items-start gap-4'>
        <button onClick={()=>navigate("/")} className='mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
          <FaArrowLeft className='text-gray-600'/>
        </button>
        <div className='text-center w-full'>
          <h1 className='text-4xl font-bold text-gray-800'>Choose Your Plan</h1>
          <p className='text-gray-500 mt-3 text-lg '>
            Flexible Pricing to match your interview preparation gaols.
          </p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
        {plans.map((plan)=>{
          const isSelected = selectedPlan === plan.id
          return(
            <motion.div key={plan.id} whileHover={!plan.default && {scale:1.03}} onClick={()=>!plan.default && setSelectedPlan(plan.id)} className={`relative rounded-3xl p-8 transition-all duration-300 border 
            ${
              isSelected
                ? "border-[#A855F7] shadow-2xl bg-white"
                : "border-gray-200 bg-white shadow-md"
            }
            ${plan.default ? "cursor-default" : "cursor-pointer"}`}>
              {plan.badge && (
                <div className='absolute top-6 right-6 bg-[#A855F7] text-white text-xs px-4 py-1 rounded-full shadow'>{plan.badge}</div>
              )}
              {plan.default && (
                <div className='absolute top-6 right-6 bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full'>Default</div>
              )}
              <h3 className='text-xl font-semibold text-gray-800'>{plan.name}</h3>
              <div className='mt-4'>
                <span className='text-3xl font-bold text-[#A855F7]'>{plan.price}</span>
                <p className='text-gray-500 mt-1 text-lg font-semibold'>{plan.credits} Credits</p>
              </div>

              <p className='text-gray-500 mt-4 text-md leading-relaxed'>{plan.description}</p>

              <div className='mt-6 space-y-3 text-left'>
                {plan.features.map((feature, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <FaCheckCircle className='text-[#A855F7] text-md' />
                    <span className='text-gray-700 text-md'>{feature}</span>
                  </div>
                ))}
              </div>
              {!plan.default &&
                <button 
                disabled={loadingPlan === plan.id}
                onClick={(e)=>{e.stopPropagation()
                  if(!isSelected ){
                    setSelectedPlan(plan.id)

                  }
                  else{
                    handlePayment(plan)
                  }
                }}
                className={`w-full mt-8 py-3 rounded-xl font-semibold transition ${
                  isSelected 
                    ? "bg-[#A855F7] text-white hover:opacity-90"
                    : "bg-gray-100 text-gray-700 hover:bg-[#FDF4FF]"
                }`}>
                  {
                    loadingPlan === plan.id
                      ?"Processing..."
                      :isSelected
                        ?"Proceed to Pay"
                        :"Select Plan"
                  }

                </button>
              }

            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Pricing