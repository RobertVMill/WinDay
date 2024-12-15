'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function TestModel() {
  return (
    <group>
      {/* Basic body shape */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 3, 32]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.7]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Test sphere for visibility */}
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  );
}

export default function ThreeDEmpireVisualizerTest() {
  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg">
      <Canvas camera={{ position: [5, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <TestModel />
        <OrbitControls />
        <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
} 
