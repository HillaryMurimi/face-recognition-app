import WebcamFeed from "@/components/WebcamFeed";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ImageUpload from "@/components/ImageUpload";

export default function Home() {
  const faces = useSelector((state: RootState) => state.face.faces)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 ">Facial Recognition App</h1>
      <WebcamFeed />
      <ImageUpload />
      {
        faces.length > 0 && (
          <div className="mt-6 w-full max-w-2xl bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Detected Faces</h2>
            <ul className="space-y-3">
              {
                faces.map((face) => (
                  <li key={face.id} className="border-b pb-2">
                    <p><strong>Age:</strong> {face.age}</p>
                    <p><strong>Gender:</strong> {face.gender}</p>
                    <p><strong>Emotion:</strong> {face.emotion}</p>
                    <p className="text-sm text-gray-500">Box: [x: {Math.round(face.box.x)}, y: {Math.round(face.box.y)}, w: {Math.round(face.box.width)}, h: {Math.round(face.box.height)}]</p>
                  </li>
                ))
              }
            </ul>
          </div>
        )
      }
    </main>
  )
}