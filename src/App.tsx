import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, useTexture, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Plus, Trash2 } from 'lucide-react';

// 1 Unit = 1 Foot in our 3D space
const INCHES_TO_FEET = 1 / 12;

// Real-world dimensions from the floorplan (37'-8" x 31'-1")
const FLOOR_WIDTH = 37 + 8 / 12;
const FLOOR_DEPTH = 31 + 1 / 12;

interface FurnitureItem {
  id: string;
  name: string;
  width: number; // in inches
  depth: number; // in inches
  height: number; // in inches
  color: string;
  position: [number, number, number]; // x, y, z in feet
  rotation: [number, number, number];
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function FloorplanMap() {
  const texture = useTexture('/floorplan.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[FLOOR_WIDTH, FLOOR_DEPTH]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function FurnitureMesh({ 
  item, 
  isSelected, 
  onSelect, 
  onUpdate 
}: { 
  item: FurnitureItem; 
  isSelected: boolean; 
  onSelect: () => void;
  onUpdate: (id: string, position: [number, number, number]) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convert inches to feet for rendering
  const w = item.width * INCHES_TO_FEET;
  const h = item.height * INCHES_TO_FEET;
  const d = item.depth * INCHES_TO_FEET;

  const content = (
    <mesh 
      ref={meshRef}
      position={[item.position[0], h / 2, item.position[2]]} 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial 
        color={item.color} 
        opacity={0.8} 
        transparent 
        roughness={0.2}
        metalness={0.1}
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color={isSelected ? 'white' : 'black'} linewidth={isSelected ? 3 : 1} />
      </lineSegments>
    </mesh>
  );

  if (isSelected) {
    return (
      <TransformControls 
        object={meshRef as any} 
        mode="translate"
        showY={false} // Only move on the floor
        onObjectChange={() => {
          if (meshRef.current) {
            onUpdate(item.id, [
              meshRef.current.position.x,
              item.position[1],
              meshRef.current.position.z
            ]);
          }
        }}
      >
        {content}
      </TransformControls>
    );
  }

  return content;
}

export default function App() {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('Sofa');
  const [width, setWidth] = useState('80');
  const [depth, setDepth] = useState('36');
  const [height, setHeight] = useState('32');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: FurnitureItem = {
      id: Date.now().toString(),
      name,
      width: parseFloat(width) || 24,
      depth: parseFloat(depth) || 24,
      height: parseFloat(height) || 24,
      color: COLORS[items.length % COLORS.length],
      position: [0, 0, 0], // Spawn at center
      rotation: [0, 0, 0]
    };
    setItems([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const updateItemPosition = (id: string, position: [number, number, number]) => {
    setItems(items.map(it => it.id === id ? { ...it, position } : it));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="w-full h-screen flex bg-neutral-900 text-white font-sans overflow-hidden">
      {/* Sidebar Panel */}
      <div className="w-80 bg-neutral-800 border-r border-neutral-700 flex flex-col shadow-xl z-10 relative">
        <div className="p-6 border-b border-neutral-700">
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            CAD Apartment 3D
          </h1>
          <p className="text-sm text-neutral-400">Design your perfect layout</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">Add Furniture</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Item Name</label>
                <input 
                  type="text" 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">W (in)</label>
                  <input 
                    type="number" 
                    value={width} onChange={(e) => setWidth(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">D (in)</label>
                  <input 
                    type="number" 
                    value={depth} onChange={(e) => setDepth(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">H (in)</label>
                  <input 
                    type="number" 
                    value={height} onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add to Room
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">Room Inventory</h2>
            {items.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">No items added yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${selectedId === item.id ? 'bg-blue-900/40 border border-blue-500/50' : 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700'}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-sm font-medium text-neutral-200">{item.name}</p>
                        <p className="text-xs text-neutral-500">{item.width}"W × {item.depth}"D × {item.height}"H</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="text-neutral-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D Canvas View */}
      <div className="flex-1 relative" onClick={() => setSelectedId(null)}>
        <Canvas shadows camera={{ position: [0, 20, 15], fov: 60 }}>
          <color attach="background" args={['#171717']} />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048} 
          />
          
          <Grid 
            args={[50, 50]} 
            cellSize={1} // 1 foot cells
            cellThickness={1} 
            cellColor="#404040" 
            sectionSize={5} 
            sectionThickness={1.5} 
            sectionColor="#6b7280" 
            fadeDistance={40} 
            fadeStrength={1} 
          />

          <React.Suspense fallback={null}>
            <FloorplanMap />
          </React.Suspense>

          {items.map(item => (
            <FurnitureMesh 
              key={item.id} 
              item={item} 
              isSelected={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
              onUpdate={updateItemPosition}
            />
          ))}

          {/* We only enable orbit controls when no item is selected, or we make sure TransformControls overrides it */}
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} />
        </Canvas>
        
        {/* Helper overlay */}
        <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-3 rounded-lg pointer-events-none">
          <p className="text-sm text-neutral-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Drag items to move
          </p>
          <p className="text-sm text-neutral-300 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Left click + drag to rotate camera
          </p>
        </div>
      </div>
    </div>
  );
}
