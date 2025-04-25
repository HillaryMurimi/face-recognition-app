'use client'

import { useEffect, useRef, useState  } from "react"
import * as faceapi from 'face-api.js'
import { useDispatch } from "react-redux"
import { setFaces, clearFaces } from "@/redux/slices/faceSlice"

const WebcamFeed = () => {
     const videoRef = useRef<HTMLVideoElement | null>(null)
     const canvasRef = useRef<HTMLCanvasElement | null>(null)
     const dispatch = useDispatch()

     const [isStreaming, setIsStreaming] = useState(false)

     const loadModels = async () => {
        const MODEL_URL = '/models'
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ])
     }

     const startVideo = async () => {
        setIsStreaming(true)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (error) {
            console.error("Error accessing webcam: ", error)
        }
     }

     const stopVideo = () => {
        setIsStreaming(false)
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
            tracks.forEach((track) => track.stop())
            videoRef.current.srcObject = null
        }
        dispatch(clearFaces())
     }

     const detectFaces = async () =>{
        if (!videoRef.current || !canvasRef.current) {
            return
        }

        const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
        ).withAgeAndGender().withFaceExpressions()

        const faceData = detections.map((det, i) => ({
            id: `${Date.now()}- ${i}`,
            age: Math.round(det.age),
            gender: det.gender,
            emotion: Object.entries(det.expressions).sort((a, b) => b[1] - a[1])[0][0],
            box: det.detection.box
         }))

         dispatch(setFaces(faceData))

         canvasRef.current.innerHTML = ''
         faceapi.draw.drawDetections(canvasRef.current, detections.map(d => d.detection))
     }

     useEffect(() => {
        loadModels()
     }, [])

     useEffect(() => {
        let interval: NodeJS.Timeout
        if (isStreaming) {
            interval = setInterval(detectFaces, 1000)
        }
        return () => clearInterval(interval)
     }, [isStreaming])

     return(
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <video ref={videoRef} autoPlay muted className="rounded-xl w-full max-w-md" />
                <canvas ref={canvasRef} className="absolute top-0 left-0" />
            </div>
            <div className="flex gap-4">
                <button
                    onClick={startVideo}
                    className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
                >
                    Start Webcam
                </button>
                <button
                    onClick={stopVideo}
                    className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
                >
                    Stop Webcam
                </button>
            </div>
        </div>
     )
}

export default WebcamFeed