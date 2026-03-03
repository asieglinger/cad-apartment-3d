import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Plus, Trash2, RotateCw } from 'lucide-react';

const INCHES_TO_FEET = 1 / 12;

type WallData = {
  start: [number, number];
  end: [number, number];
  height?: number;
  elevation?: number;
  thickness?: number;
  glass?: boolean;
};

const WALLS: WallData[] = [
  // Top Wall (z=0)
  { start: [0, 0], end: [2, 0], thickness: 1 },
  { start: [2, 0], end: [14, 0], thickness: 1, glass: true, height: 6, elevation: 2 },
  { start: [2, 0], end: [14, 0], thickness: 1, height: 2 },
  { start: [2, 0], end: [14, 0], thickness: 1, height: 1, elevation: 8 },
  { start: [14, 0], end: [16, 0], thickness: 1 },
  { start: [16, 0], end: [24, 0], thickness: 1, glass: true, height: 6, elevation: 2 },
  { start: [16, 0], end: [24, 0], thickness: 1, height: 2 },
  { start: [16, 0], end: [24, 0], thickness: 1, height: 1, elevation: 8 },
  { start: [24, 0], end: [26.58, 0], thickness: 1 },
  { start: [26.58, 0], end: [35, 0], thickness: 1, glass: true, height: 6, elevation: 2 },
  { start: [26.58, 0], end: [35, 0], thickness: 1, height: 2 },
  { start: [26.58, 0], end: [35, 0], thickness: 1, height: 1, elevation: 8 },
  { start: [35, 0], end: [37.66, 0], thickness: 1 },

  // Right Wall
  { start: [37.66, 0], end: [37.66, 18.33], thickness: 1 },

  // Bottom Right Exterior
  { start: [37.66, 18.33], end: [8, 18.33], thickness: 1 },

  // Inner Corner
  { start: [8, 18.33], end: [8, 31.08], thickness: 1 },

  // Bottom Left Exterior
  { start: [8, 31.08], end: [3, 31.08], thickness: 1 },
  { start: [3, 31.08], end: [0, 31.08], thickness: 1, height: 2, elevation: 7 },

  // Left Wall
  { start: [0, 31.08], end: [0, 0], thickness: 1 },

  // --- Internal Walls ---
  
  // Bathroom Top
  { start: [18.5, 4], end: [20, 4] },
  { start: [23, 4], end: [26.58, 4] },
  { start: [20, 4], end: [23, 4], height: 2, elevation: 7 },

  // Bathroom Left (Kitchen Back)
  { start: [18.5, 4], end: [18.5, 18.33] },

  // Bathroom Right (Bedroom Left)
  { start: [26.58, 4], end: [26.58, 18.33] },

  // Bedroom Top (Doorway)
  { start: [26.58, 0], end: [26.58, 1] },
  { start: [26.58, 1], end: [26.58, 4], height: 2, elevation: 7 },

  // Bedroom Closet
  { start: [26.58, 15.91], end: [37.66, 15.91] },

  // Hallway Closets
  { start: [3, 18.33], end: [3, 31.08] },
  { start: [0, 22], end: [3, 22] },
  { start: [0, 26], end: [3, 26] },
];

function Wall({ data }: { data: WallData }) {
  const { start, end, height = 9, elevation = 0, thickness = 0.5, glass = false } = data;
  
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  
  const cx = start[0] + dx / 2;
  const cz = start[1] + dz / 2;
  const cy = elevation + height / 2;

  return (
    <mesh 
      position={[cx, cy, cz]} 
      rotation={[0, -angle, 0]} 
      castShadow={!glass} 
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      {glass ? (
        <meshPhysicalMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.3} 
          roughness={0.1} 
          transmission={0.9} 
          thickness={0.5} 
        />
      ) : (
        <meshStandardMaterial color="#f8f9fa" roughness={1} />
      )}
    </mesh>
  );
}

function ApartmentFloor() {
  const mainFloorShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(37.66, 0);
    shape.lineTo(37.66, -18.33);
    shape.lineTo(8, -18.33);
    shape.lineTo(8, -31.08);
    shape.lineTo(0, -31.08);
    shape.closePath();
    return shape;
  }, []);

  const bathFloorShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(18.5, -4);
    shape.lineTo(26.58, -4);
    shape.lineTo(26.58, -18.33);
    shape.lineTo(18.5, -18.33);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Main Floor (Wood/Light tile) */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <shapeGeometry args={[mainFloorShape]} />
        <meshStandardMaterial color="#e5e5e0" roughness={0.8} />
      </mesh>
      
      {/* Bathroom Floor (Dark tile) */}
      <mesh receiveShadow position={[0, 0, 0.01]}>
        <shapeGeometry args={[bathFloorShape]} />
        <meshStandardMaterial color="#404040" roughness={0.4} />
      </mesh>
    </group>
  );
}

function BuiltIns() {
  return (
    <group>
      {/* Kitchen Counters */}
      <mesh position={[17.375, 1.5, 1]} castShadow receiveShadow>
        <boxGeometry args={[2.25, 3, 2]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      <mesh position={[17.5, 1.5, 6]} castShadow receiveShadow>
        <boxGeometry args={[2, 3, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>

      {/* Bathroom Shower */}
      <mesh position={[22.54, 3.5, 16.66]} castShadow receiveShadow>
        <boxGeometry args={[8.08, 7, 3.33]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.6} transmission={0.5} roughness={0.2} />
      </mesh>

      {/* Bathroom Vanity */}
      <mesh position={[25.58, 1.5, 8]} castShadow receiveShadow>
        <boxGeometry args={[2, 3, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
    </group>
  );
}

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
  
  const w = item.width * INCHES_TO_FEET;
  const h = item.height * INCHES_TO_FEET;
  const d = item.depth * INCHES_TO_FEET;

  const content = (
    <mesh 
      ref={meshRef}
      position={[item.position[0], h / 2, item.position[2]]} 
      rotation={item.rotation as any}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial 
        color={item.color} 
        roughness={0.6}
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
        showY={false}
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

  const [name, setName] = useState('Sofa');
  const [width, setWidth] = useState('80');
  const [depth, setWidth2] = useState('36');
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
      position: [8, 0, 9], // Spawn in the living room
      rotation: [0, 0, 0]
    };
    setItems([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const updateItemPosition = (id: string, position: [number, number, number]) => {
    setItems(items.map(it => it.id === id ? { ...it, position } : it));
  };

  const rotateItem = (id: string) => {
    setItems(items.map(it => {
      if (it.id === id) {
        return {
          ...it,
          rotation: [it.rotation[0], it.rotation[1] - Math.PI / 2, it.rotation[2]]
        };
      }
      return it;
    }));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="w-full h-screen flex bg-neutral-900 text-white font-sans overflow-hidden">
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
                    value={depth} onChange={(e) => setWidth2(e.target.value)}
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
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); rotateItem(item.id); }}
                        className="text-neutral-500 hover:text-blue-400 p-1"
                        title="Rotate 90 degrees"
                      >
                        <RotateCw size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                        className="text-neutral-500 hover:text-red-400 p-1"
                        title="Delete item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative" onClick={() => setSelectedId(null)}>
        <Canvas shadows camera={{ position: [18, 25, 35], fov: 50 }}>
          <color attach="background" args={['#171717']} />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 30, 20]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048} 
            shadow-bias={-0.0005}
          />
          <Environment preset="city" />
          
          <Grid 
            position={[18, -0.01, 15]}
            args={[60, 60]} 
            cellSize={1}
            cellThickness={1} 
            cellColor="#404040" 
            sectionSize={5} 
            sectionThickness={1.5} 
            sectionColor="#6b7280" 
            fadeDistance={50} 
            fadeStrength={1} 
          />

          <ApartmentFloor />
          <BuiltIns />

          {WALLS.map((wall, i) => (
            <Wall key={i} data={wall} />
          ))}

          {items.map(item => (
            <FurnitureMesh 
              key={item.id} 
              item={item} 
              isSelected={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
              onUpdate={updateItemPosition}
            />
          ))}

          <OrbitControls makeDefault target={[18, 0, 15]} minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} />
        </Canvas>
        
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
