'use client'

import { useRef, useState } from "react"
import * as faceapi from 'face-api.js'
import { useDispatch } from "react-redux"
import { setFaces, clearFaces } from "@/redux/slices/faceSlice"

const ImageUpload = () => {
    const imgRef = useRef<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const dispatch = useDispatch()

    const [imageURL, setImageURL] = useState<string>('')

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(clearFaces())

        const file = e.target.files?.[0]
        if (!file) return

        const image = URL.createObjectURL(file)
        setImageURL(image)

        setTimeout(async () => {
            if (!imgRef.current) return

            // Load models from public/models
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
            await faceapi.nets.ageGenderNet.loadFromUri('/models')
            await faceapi.nets.faceExpressionNet.loadFromUri('/models')
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models')

            // Detect faces with landmarks, age, gender and expressions
            const detections = await faceapi
                .detectAllFaces(imgRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withAgeAndGender()
                .withFaceExpressions()

            // Map data for Redux
            const faceData = detections.map((det, i) => ({
                id: `${Date.now()} - ${i}`,
                age: Math.round(det.age),
                gender: det.gender,
                emotion: Object.entries(det.expressions).sort((a, b) => b[1] - a[1])[0][0],
                box: det.detection.box
            }))

            dispatch(setFaces(faceData))

            // Draw on canvas
            if (canvasRef.current && imgRef.current) {
                const canvas = canvasRef.current
                const image = imgRef.current

                canvas.width = image.width
                canvas.height = image.height

                faceapi.draw.drawDetections(canvas, detections)
                faceapi.draw.drawFaceLandmarks(canvas, detections)
                faceapi.draw.drawFaceExpressions(canvas, detections)
            }

        }, 100)
    }

    return (
        <div className="flex flex-col items-center gap-4 mt-6">
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
            />
            {
                imageURL && (
                    <div className="relative">
                        <img
                            ref={imgRef}
                            src={imageURL}
                            alt="Uploaded"
                            className="rounded-xl max-w-full"
                        />
                        <canvas ref={canvasRef} className="absolute top-0 left-0" />
                    </div>
                )
            }
        </div>
    )
}

export default ImageUpload
